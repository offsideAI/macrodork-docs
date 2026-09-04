# Hardware Spec Sheet

> 📘 New to this? Start with the [hardware primer](hardware-primer.md) (one board at a time); the full derivation is in the [hardware teardown](hardware-teardown.md).

> The one-page version. The complete derivation and evidence are in [hardware-teardown.md](hardware-teardown.md).
> Every figure comes from the source, device trees and config files of `pollen-robotics/microduck` - **the code is the datasheet**.

**In one sentence**: a Radxa Zero 3W (RK3566) running Armbian + one 1 Mbps TTL serial bus carrying 15
Dynamixel XL330 servos + two custom boards.

---

## Block Diagram

```
                ┌──────────────────────────────┐
                │   Radxa Zero 3W (RK3566)     │  65 × 30 mm
                │   Armbian · kernel 6.1.115   │  Pi Zero form factor
                └──┬────────┬─────────┬────────┘
      /dev/ttyS2   │        │ 40-pin  │ MIPI CSI
      1 Mbps TTL   │        │  I2C3   │
    ┌──────────────┘        │ 400kHz  └── IMX219 camera (rotated 90°)
    │                       │
    │              ┌────────▼─────────────────┐
    │              │  RPI Robot HAT           │  65×30mm custom (published)
    │              │   ├ TLV320AIC3104  0x18  │  audio codec
    │              │   ├ BMI088   0x19/0x68   │  fitted but unused
    │              │   └ Stemma J5 → ToF 0x29 │  VL53L5CX/L8CX
    │              │  battery feeds the robot │
    │              │  through this board      │
    │              └──────────────────────────┘
    │
════╪══════════ Dynamixel bus · Protocol V2 · 1 Mbps ══════════
    │
    ├── 15 × XL330   IDs: L leg 20-24 / neck-head-mouth 30-34 / R leg 10-14
    └── imu_to_dxl v2 board   ID 200   ← LSM6DSV16X
```

**Core design**: one bus does everything. The IMU is not on I²C; it is built as a Dynamixel slave on the servo bus
and read in the **same `sync_read`** as the 15 servos. Pack voltage needs no fuel gauge either:
the firmware reads what the servos report as their own supply.

---

## Main Board

| Item | Value |
|---|---|
| Module | **Radxa Zero 3W** - a stock module, **not a custom carrier** |
| SoC | **RK3566** (4× Cortex-A55 + Mali-G52 + NPU) |
| Size | 65 × 30 mm, Pi Zero form factor, 40-pin Raspberry Pi-compatible header |
| OS | **Armbian** (Debian-based), vendor kernel 6.1.115 |
| Policy inference | ONNX Runtime ≥1.23 (installs 1.28.0), loaded with `dlopen` |
| NPU inference | rknn-toolkit2 - **disabled by default in Armbian**; flash the overlay and reboot |

> Evidence: device tree `compatible = "radxa,zero-3w", "rockchip,rk3566"`;
> "radxa" appears 182 times across the repository.

### Why the rumour says Raspberry Pi

1. The custom board is **literally called "RPI Robot HAT"**
2. Pi Zero form factor + 40-pin Raspberry Pi-compatible header
3. The camera is a **Raspberry Pi Camera v2** (IMX219)
4. **The prototype really did use a Raspberry Pi Zero 2W** - from the `robotd.toml` comment: the 50 Hz control loop
   *"is inherited from the prototype, where it was chosen on a Raspberry Pi Zero 2W"*

Its predecessor, Open Duck Mini v2, **still runs on a Raspberry Pi Zero 2W today**, because it does no vision and no WebRTC streaming.

### Why a Linux SoC rather than an MCU

It has to run, all at once: ONNX policy inference @ 50 Hz, 720p30 H.264 hardware encoding + WebRTC streaming,
NPU object detection, GStreamer congestion control (7.6% of one core), Bluetooth gamepad + phone app + Wi-Fi.
**An STM32 / ESP32 cannot do this.**

---

## Actuators and Bus

| Item | Value |
|---|---|
| Motors | **Dynamixel XL330 × 15** (about 18 g each) |
| Physical layer | **single-wire half-duplex TTL** (3 wires: data + VDD + GND), 3.3 V |
| Protocol | **Dynamixel Protocol V2** |
| Rate | **1 Mbps** (EEPROM `baud_rate = 3`) |
| Port | `/dev/ttyS2` = RK3566 **UART2, M0 pin mux** |
| Devices on the bus | **16**: 15 servos + 1 IMU board |
| Control loop | **50 Hz**, one `sync_read` covering all 16 devices, registers 124–136 |
| Rust crate | [`rustypot`](https://github.com/pollen-robotics/rustypot) |

> ❗ **Not RS-232, not RS-485.** RS-485 is a differential pair, used only by Dynamixel's XM/XH series.
> The XL330 is single-wire half-duplex TTL. Searching the whole repository for `rs485|rs232|direction pin` returns **zero hits** -
> there is no direction-control GPIO in the code; direction switching is done by a self-steering hardware circuit (on the HAT).

### Servo ID assignment

```
Left leg    20 21 22 23 24    hip_yaw / hip_roll / hip_pitch / knee / ankle
Neck+head   30 31 32 33 34    neck_pitch / head_pitch / head_yaw / head_roll / mouth
Right leg   10 11 12 13 14    (mirror of the left)
IMU board   200
```

**The 15th servo is the mouth (ID 34, index 9).** Every policy is `obs[1,61] → act[1,14]`,
and the action vector **skips that index** - the mouth is driven by higher-level logic, not by the policy.

### Bus reliability (measured upstream)

| Metric | Value | Source |
|---|---|---|
| Drop rate | **about 8 per minute ≈ 0.27%** | *"Measured on a bench robot at ~8 drops a minute"* |
| Official characterisation | *"One dropped Dynamixel transaction is **ordinary**"* | `robotd/src/main.rs` |
| Symptom | random small twitches (a dropped read stalls the policy for one tick, back to the hold pose) | same |
| Tolerance | `COAST_TICKS = 3`: coast on the last good sample for 60 ms | same |
| Upper limit | `max_consecutive_errors = 10` | `robotd.toml` |
| Loop stability | `missed=3` / 15022 ticks, holding 50.0 Hz | `roadmap.md` |
| Stale IMU data | a dedicated `StaleImuTracker`; the comment says *"Known to happen"* | `bus.rs` |

Estimated bus utilisation **about 25%** (about 500 bytes/tick ÷ 1 Mbps ÷ 20 ms) -
**the bottleneck is not bandwidth but signal integrity and single points of failure**: single-ended 3.3 V signalling,
15 servos daisy-chained, a harness passing through a dynamically flexing neck, right next to the motor PWM noise sources.

---

## The Two Upstream-Designed Boards (one published, one to draw yourself)

### 1. `imu_to_dxl` v2 - very few components, the easiest to build yourself

| Item | Value |
|---|---|
| IMU chip | **LSM6DSV16X** (ST 6-axis, with the SFLP on-chip attitude-fusion block) |
| Interface | **Dynamixel bus** (not I²C) |
| Bus ID | **200** |
| Register address | **124** |
| Read by control loop | 12 bytes |
| Full diagnostic block | 20 bytes (also raw accelerometer, sample counter, status flags) |

**12-byte block layout**

| Bytes | Contents |
|---|---|
| `0..6` | gyro x/y/z, `i16` little-endian, ±500 dps, **17.5 mdps/LSB** |
| `6..12` | SFLP quaternion x/y/z, **IEEE fp16**; `w = √(1 − x² − y² − z²)` |

**To build one you need**: an LSM6DSV16X + a small MCU acting as a Dynamixel V2 slave
(STM32G0/G4, CH32V203 or ESP32 all work) + a half-duplex TTL transceiver, powered from the bus.

### 2. RPI Robot HAT - published upstream, just have it fabricated

**65.0 × 30.9 mm, 1.0 mm thick, 4-layer board** (from the official KiCad and Gerbers, see [BOM](../BOM.md)). The 65.02 × 30.02 × 0.84 measured from the STL mesh is a simulation approximation - **do not use it to order**. Plugs onto the 40-pin header.

| Part | I²C address | Notes |
|---|---|---|
| **TLV320AIC3104** | `0x18` | TI audio codec, I²S data + I²C control |
| **BMI088** | `0x19` / `0x68` | **fitted but unused** (the comment says "dormant") |
| **ToF** | `0x29` | not on the board; external via **Stemma J5** |

- I²C: header **pins 3 / 5** (`GPIO1_A0` = SDA, `GPIO1_A1` = SCL), **400 kHz**
- Pull-ups: **a single 10k pair, R12/R13**
- Audio clocks: MCLK **12 MHz**, I²S sysclk **12.288 MHz** (256 × 48 kHz)
- Microphone on **Mic3R** (mono, right PGA); every other input switched off
- **The robot's internal power runs through this board**

---

## Sensors

| Type | Part | Interface | Notes |
|---|---|---|---|
| IMU | **LSM6DSV16X** | Dynamixel bus, ID 200 | on-chip SFLP emits the quaternion; the host runs no fusion |
| ToF | **VL53L5CX / VL53L8CX** | I²C `0x29` on i2c3 | 15 Hz, multizone ranging |
| Camera | **IMX219** (Raspberry Pi Camera v2) | MIPI CSI, I²C `0x10` | **rotated 90°**, see [hardware teardown](hardware-teardown.md#7-sensors) |

- The camera sensor is pinned to the 1920×1080@30 mode (avoiding the boot-default mode's 21 fps cap),
  scaled by the ISP, default output 720p30 @ 2 Mb/s
- Encoding via the **Rockchip MPP hardware encoder** → WebRTC
- HFOV about 62°

---

## Power and Battery

| Item | Value |
|---|---|
| Battery | **Sony NP-F550** (L-series camcorder pack). ⚠️ The upstream mesh name `np_f970` is misleading; the measured size is an F550 |
| Configuration | **2S Li-ion**, 7.2 V nominal |
| Full (under load) | **8.2 V** |
| Empty (under load) | **6.6 V** |
| Fuel gauge | **none** |
| ADC | **none** |

> From the source: *"There is no fuel gauge and no ADC. The only measurement available is
> what the servos report as their own supply."*

**The voltage is read over the Dynamixel protocol, from what the servos report as their own supply** - the battery as seen through the bus,
which sags under load and recovers at rest. So 6.6–8.2 V is a **usable-under-load range**, not the cells' chemical range.

When the battery EMA (about a 10-second time constant) reaches 6.6 V → **the robot sits down gracefully and powers off**.

> 💡 Replica-friendly: **no battery-monitoring circuit needs to be designed.**

---

## Every Interface at a Glance

| Interface | Used for | Parameters |
|---|---|---|
| **UART2** (`ttyS2`) | 15 servos + IMU board | 1 Mbps, TTL half-duplex |
| **I2C3** (pins 3/5, M0) | audio codec / ToF / (the unused BMI088) | 400 kHz |
| **I2S3** | audio data | MCLK 12 MHz, sysclk 12.288 MHz |
| **MIPI CSI** | IMX219 camera | I²C control `0x10` |
| Bluetooth | gamepad (`padd`), phone app (`btd`) | on-module |
| Wi-Fi | WebRTC streaming, provisioning (`configd`) | on-module |
| USB-C | power + maskrom flashing | **PD negotiation sacrificed by the overlay** |

---

## Software Parameters You Must Match

| Parameter | Value | Notes |
|---|---|---|
| Control loop | **50 Hz** | inherited from the Raspberry Pi prototype, **never re-derived on the Radxa** |
| Policy interface | `obs[1,61] → act[1,14]` | checked at load; the older 51-D version is refused |
| `action_scale` | 0.9 (walk) / 0.8 (roller) | |
| Position P gain | **200** | ×0.8 while standing |
| Action low-pass | head **0.5** / legs **0.7** | **must match training**, or transfer degrades |
| Voltage adaptation | off by default | `scale × (7.4 / measured EMA)`, clamped 6.0–9.5 V |

---

## Replica Checklist: What You Can Buy vs What You Must Build

| Part | Status | Notes |
|---|---|---|
| Radxa Zero 3W | ✅ buy | stock module |
| Dynamixel XL330 × 15 | ✅ buy | **the bulk of the cost, $359–€629** (huge spread between channels, see [BOM](../BOM.md)) |
| **NP-F550** battery + holder | ✅ buy | generic camcorder accessory. **Not the F970** |
| Raspberry Pi Camera v2 (IMX219) | ✅ buy | |
| VL53L8CX module | ✅ buy | Stemma/Qwiic, in stock |
| **`imu_to_dxl` board** | 🔧 **draw it yourself** | protocol fully recovered, only 3 kinds of component |
| **HAT board** | ✅ download the official Gerbers and fabricate | 4-layer board. Can be omitted entirely if you do not need the microphone and speaker, but **the half-duplex direction circuit must then come from a separate adapter board**, see [electronics sourcing list](electronics-sourcing-list.md#6-the-two-pcbs) |
| Control software | ✅ official, Apache-2.0 | **runs as-is** on the same main board |
| Policies | ✅ 9 official ONNX files | usable as long as the hardware is unchanged |

> 💰 **Cost warning**: the 15 XL330s alone cost **$359–€629** (from $23.90 on the ROBOTIS international store, up to €41.95 incl. tax in Europe),
> already well above the **$399** price of the whole robot. $399 is a volume price.

---

## Three Traps You Will Hit

1. **Armbian runs a login console on UART2 by default** - the `agetty` of `serial-getty@ttyS2`
   holds the port. You must `systemctl mask serial-getty@ttyS2`.
   Upstream found it with `fuser -v /dev/ttyS2`.

2. **i2c3 fights the FUSB302 for pins** - in the vendor DTB the RK3566's i2c3 runs in the M1 pin mux
   serving the USB-C PD controller; using M0 on pins 3/5 means disabling fusb302 and **losing PD negotiation**.
   Fortunately the FUSB302 presents Rd on CC by default at power-on, so plain 5 V charging still works.

3. **The NPU ships disabled** - Armbian does not enable it; flash the overlay and reboot before running RKNN models.

---

## Conclusion

**Nothing in this hardware is impossible to reproduce.** The main board is a stock module; of the two upstream-designed boards,
**the HAT is fully published** (KiCad + Gerbers + BOM + pick-and-place; download and fabricate),
and the only one you genuinely have to draw is `imu_to_dxl` - which has very few components and a fully recovered protocol.

The real barrier is **cost** (15 XL330s cost more than the whole robot), not technology.

> Sources: `duck-control/src/{model,imu,bus}.rs`, `robotd/src/main.rs`,
> `deploy/robotd.toml`, `deploy/audio/*.dts`, `deploy/overlays/*.dts`,
> `tof/src/*.rs`, `mediad/src/*.rs`, `docs/design/robotd-design.md`,
> `docs/project/{media-bringup,roadmap}.md`

---

## Official Specs vs This Repository's Teardown (Cross-Check)

Upstream announced the robot on 2026-08-27 and published some specifications. The table below sets **what was officially published**
against **what this repository recovered from the source** item by item - each side corroborates the other, and each fills in what the other lacks.

| Item | Officially published | Recovered here | Verdict |
|---|---|---|---|
| SoC | RK3566, quad A55 @1.8GHz, Mali-G52, NPU **0.8 TOPS** | RK3566 (device-tree `compatible`) | ✅ match |
| **Main-board module** | **not published** | **Radxa Zero 3W** | 🔍 **teardown only** |
| RAM / storage | **1 GB / 32 GB eMMC** | no evidence in the source | 🆕 **official only**: exactly one of the Radxa Zero 3W SKUs.<br>⚠️ For a replica we recommend 2G/16G, see [electronics sourcing list](electronics-sourcing-list.md#which-configuration-to-buy) |
| Battery | **NP-F550, 2600 mAh, about 1 hour runtime** | NP-F550, 2S, 8.2 V full / 6.6 V empty | ✅ match |
| ToF | **8 × 8** LiDAR | VL53L5CX / VL53L8CX @ `0x29` | ✅ that family is exactly 8×8 |
| Camera | front camera with indicator LED | **IMX219** (Pi Cam v2), I²C `0x10`, **rotated 90°** | 🔍 teardown is more detailed |
| **IMU** | **2 (body + head)** | LSM6DSV16X **in use**; BMI088 marked **dormant / unused** in the source | ⚠️ **contradiction, see below** |
| Motors | 15 DOF, articulated beak that can grasp | 15 × Dynamixel XL330, with the full ID table | ✅ match |
| Size and mass | 25 cm tall, **14 cm** wide, < 800 g | measured **144 × 141 × 264 mm**, **737.2 g** | ✅ match |
| **NFC** | **dual antenna** | **no mention at all** in the source | 🆕 **official only** |
| Audio | microphone + speaker | TLV320AIC3104 @ `0x18`, microphone on Mic3R | 🔍 teardown is more detailed |
| **Main bus** | **not published** | TTL half-duplex 1 Mbps, `/dev/ttyS2`, Protocol V2 | 🔍 **teardown only** |
| Connectivity | Wi-Fi, Bluetooth | same (on the Radxa module) | ✅ match |

### ⚠️ The contradiction: officially 2 IMUs, the software uses 1

The official spec says **"2× IMUs (body and head)"**, but in the source:

- **Only the LSM6DSV16X is in use** - `imu.rs` opens with *"One IMU, one code path"*
- The **BMI088** on the HAT is marked **"dormant"** and
  **"(unused but still connected)"** in the device-tree comments

**Conclusion: the second IMU is physically soldered on the board, but the shipped software does not use it.** A replica can simply omit it.

---

## Open-Source Status: The Official Position (updated 2026-08)

> From the CNX Software report:
> *"While the Microduck's software stack is open source, nothing was said about the
> mechanical and hardware design files, and **Pollen Robotics told the press not to
> refer to the robot as 'open-source hardware' (for now)**."*

**Read this carefully.** What the vendor declined is the **label** "open-source hardware" for the whole robot;
that does not mean no board has been published - in fact **the RPI Robot HAT is fully open source**
([`elec_RPI_Robot_HAT`](https://github.com/pollen-robotics/elec_RPI_Robot_HAT), Apache-2.0,
with the KiCad project, Gerbers, BOM and pick-and-place). What is genuinely unpublished is the `imu_to_dxl` board,
the editable mechanical CAD, the full BOM and the assembly documentation.

That **"(for now)"** leaves the door open, with no timeline.

> Correction 2026-09-03: this document previously said "the hardware not being open source is a line upstream drew deliberately"; that was overstated and has been corrected.

### External validation: someone independently reached the same main-board conclusion

On 2026-08-31, [@tspy](https://x.com/tspy/status/2094249218735300630) on X posted a
"Microduck physical architecture breakdown" (169 likes), independently listing:

> Actuators 15 × Dynamixel XL330 · main board **Radxa ZERO 3W / Rockchip RK3566** ·
> 1 GB RAM + 32 GB · dual 6-axis IMU · 8×8 ToF · forward camera · 2× NFC antennas ·
> NP-F550 battery · 50 Hz control rate

**Fully consistent with this repository's teardown**, including the most important item, the **Radxa Zero 3W** -
two independent paths reaching the same answer raises confidence considerably.

> 📌 **Note: as of 2026-08-31 no physical unit exists on the market** (shipping starts before Christmas).
> So every "teardown" so far is **inference from public software and specs**, not a physical disassembly.
> This repository's depth (I²C addresses, register layout, the 12-byte data block, the bus protocol)
> goes one layer beyond the spec list, by reading the Rust source as the datasheet.

In the same thread, @tspy's answer when asked about cost also agrees with this repository: **"the cost appears to be higher than just buying one"**.

### Three issues the community is pressing on (no official reply as of 2026-08-31)

| Issue | Request |
|---|---|
| [#175](https://github.com/pollen-robotics/microduck/issues/175) | **STEP files** - the STLs carry no normals, so curved surfaces render as polygon blocks |
| [#173](https://github.com/pollen-robotics/microduck/issues/173) | **3D-print source files** |
| [#174](https://github.com/pollen-robotics/microduck/issues/174) | whether the battery can be charged in place, and directly whether **the power-board schematic is on the open-source roadmap** |

Of the roughly 10 recent issues checked, **not one has a reply from an upstream maintainer**, yet the repository is still updated daily.

> This also shows the value of what this repository does: nobody in the community is currently deriving assembly drawings from the MJCF,
> and nobody is systematically digging the electronics design out of the Rust source.
