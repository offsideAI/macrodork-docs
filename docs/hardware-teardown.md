# Hardware Teardown

**Method:** the Rust runtime is open source, and a runtime that drives real hardware has
to hard-code device paths, I²C addresses, register offsets, baud rates and protocols.
**The code is the datasheet.** Everything below comes from the source, device trees and
config files in the `pollen-robotics/microduck` repository.

---

## 1. System Overview

> 📍 **The one thing people get wrong first:** **the main board, the HAT and the camera are all in the head** (the MJCF `jaw_soft` body, `robot_walk.xml:235` and `:247`); the camera sits about 13 mm from the main-board centre with no joint in between. The trunk cavity is essentially filled by the two hip-yaw servos, and the battery hangs externally at the lower rear of the body.
> Only two harnesses pass through the three-DOF neck: the servo bus and the `+BATT` supply.
> See [Electronics sourcing list, where the boards go](electronics-sourcing-list.md#first-get-this-straight-where-the-boards-are-mounted).

```
                    ┌──────────────────────────────┐
                    │   Radxa Zero 3W (RK3566)     │  65 × 30 mm
                    │   Armbian / kernel 6.1.115   │  Pi Zero form factor
                    └──┬────────┬─────────┬────────┘
          /dev/ttyS2   │        │ 40-pin  │ MIPI CSI
          1 Mbps UART  │        │         │
        ┌──────────────┘        │         └── IMX219 camera (rotated 90°)
        │                       │
        │              ┌────────▼─────────────────┐
        │              │  RPI Robot HAT           │  65×30mm custom (published)
        │              │  i2c3 @ 400 kHz          │
        │              │   ├ TLV320AIC3104  0x18  │  audio codec
        │              │   ├ BMI088   0x19/0x68   │  fitted but unused
        │              │   └ Stemma J5 → ToF 0x29 │
        │              │  battery feeds the robot │
        │              │  through this board      │
        │              └──────────────────────────┘
        │
   ═════╪═══════════ Dynamixel bus (Protocol V2, 1 Mbps) ═══════════
        │
        ├── 15 × Dynamixel XL330   IDs: L leg 20-24 / neck-head-mouth 30-34 / R leg 10-14
        └── imu_to_dxl v2 board    ID: 200      ← the second custom board
              └ LSM6DSV16X
```

**The central design idea: one Dynamixel bus does everything.** The IMU is not on I²C -
it is built as a Dynamixel slave sitting on the servo bus, and is read in the **same
`sync_read` transaction** as the servos. Pack voltage needs no fuel gauge either: the
firmware simply reads what the servos report as their own supply.

---

## 2. Main Board: Radxa Zero 3W

| Item | Value | Evidence |
|---|---|---|
| SoC | **RK3566** | `compatible = "radxa,zero-3w", "rockchip,rk3566"` |
| Form factor | Pi Zero, 65×30 mm, 40-pin header | matches the size of `pcb__raspberry_pi_zero_2_w.stl` |
| OS | **Armbian** (Debian-based), vendor kernel 6.1.115 | `armbianEnv.txt`, overlay comments |
| Servo serial port | **`/dev/ttyS2`** | `deploy/robotd.toml` |
| NPU | **0.8 TOPS / INT8 / single core**, node `npu@fde40000`, **disabled by default in Armbian** | `npu-bringup.md`; overlay + `setup-npu.sh` + reboot, see [§7b](#7b-the-npu-and-on-board-vision) |
| Policy inference | ONNX Runtime ≥1.23 (installs 1.28.0), loaded with `dlopen` | `Cargo.toml` workspace metadata |
| NPU inference | rknn-toolkit2 runtime | same |

> 💡 **The single most important finding:** the main board is not a custom carrier.
> It is an **off-the-shelf Radxa Zero 3W**. An earlier version of this document claimed
> "the RK3566 carrier is custom and unobtainable" - that was wrong. It is a stock module.

---

## 3. `imu_to_dxl` v2 - the one board you must build

**The most elegant piece of the design, and the easiest one to reproduce.**

| Item | Value |
|---|---|
| IMU chip | **LSM6DSV16X** (ST 6-axis, with the SFLP on-chip sensor-fusion block) |
| Interface | **Dynamixel bus** - *not* I²C |
| Bus ID | **200** |
| Register address | **124** |
| Read by control loop | 12 bytes |
| Full diagnostic block | 20 bytes (also raw accelerometer, sample counter, status flags) |

### The 12-byte block

| Bytes | Contents |
|---|---|
| `0..6` | gyro x/y/z, `i16` little-endian raw counts, range **±500 dps**, **17.5 mdps/LSB** |
| `6..12` | SFLP quaternion x/y/z as **IEEE half-precision (fp16)**; `w = √(1 − x² − y² − z²)` |

### Why it is built this way

1. **No extra bus** - it comes back in the same `sync_read` as the 15 servos, at zero
   additional cost.
2. **No host-side fusion** - the LSM6DSV16X's SFLP block emits a game-rotation quaternion
   on-chip and estimates its own gyro bias.
3. **Only three quaternion components are sent** - a unit quaternion lets `w` be
   reconstructed, saving a byte pair so the whole thing fits in one transaction.

### What it takes to build one

- LSM6DSV16X (or a pin-compatible ST 6-axis part)
- A small MCU acting as a Dynamixel Protocol V2 slave (an STM32G0 or CH32V is plenty)
- A half-duplex TTL transceiver (the Dynamixel bus is single-wire half-duplex)
- Power taken from the bus

**This is the board most worth designing yourself in the whole project** - few components,
clear logic, and the protocol is public.

---

## 4. RPI Robot HAT - **already published; do not redraw it**

> 📌 **Correction (2026-09-03)**: this section previously treated the board as unpublished and
> in need of reverse engineering. **That was wrong.** The board is fully open at
> [`pollen-robotics/elec_RPI_Robot_HAT`](https://github.com/pollen-robotics/elec_RPI_Robot_HAT)
> (**Apache-2.0**): KiCad 9 schematic and PCB, Gerbers, BOM, pick-and-place, STEP, plus every
> datasheet. The earlier search covered only the `microduck` repository and missed the
> organisation's `elec_`-prefixed hardware repositories.

**Download the official Gerbers and order the board. This section is kept as a
reverse-engineering-versus-reality record.**

### ⚠️ Four things to know before you order it

**1. There is no charging circuit and no USB-C input on this board.**

The repository contains a `pwr_supply_charge.kicad_sch`, which makes it easy to assume the board
charges the battery. **It is an orphan sheet** - `main.kicad_sch` instantiates only
`audio / dynamixel / power / sensors`, never it, and its title block still reads
`Chromapi's Power Supply & Charge`, a leftover from another project.

Checked against the production BOM: `CN3302` (Li-ion charger), `HY2120` (protection), the USB-C
receptacle, the power switch, the indicator LEDs, `AO4435`/`FDS6630A` - **none of them are on it.**

Only two power parts are actually fitted:

| Ref | Part | Function |
|---|---|---|
| `U10` | **LM5050-1** | Ideal-diode OR-ing + switch-off detection (IO_06). ⚠️ It sits on the `+5V` rail **after** the buck, not on the battery input as reverse protection; see the power-tree correction below |
| `U9` | **AP63205** | Buck converter |

> **The battery must be charged with an external charger.** Plugging in USB-C will not charge the robot.

### The HAT's power tree (checked against schematic pages 4/6, `dynamixel.kicad_sch`)

```
NP-F550 battery ──► +BATT ──┬──► J13 / J14  Dynamixel-3 (TTL 3P, JST EH 2.5mm)
  2S, 6.6–8.2V              │      via TH1 100R thermistor, schematic note "3A max"
                            │
                            ├──► J3 / J11   Dynamixel-4 (RS-485 4P, JST EH 2.5mm)
                            │      straight from +BATT, driven by U8 SIT3088E
                            │
                            └──► C19 10µF/63V ──► U9 AP63205 + L4 6.8µH ──► Q2 / U10 LM5050-1 ──► +5V
                                                    2A / Fsw 1.1MHz            ideal-diode ORing        │
                                                                               + switch-off detect      │
                                                                                 (IO_06)                │
                                                                                                        ├─► Raspberry Pi 40-pin J4
                                                                                                        ├─► audio amp PAM8406D
                                                                                                        └─► U3 XC6206P182 → +1V8 (codec)
```

> `+3V3` goes the other way: the main board supplies it to the HAT over the 40-pin header; the HAT does not generate it.
>
> ⚠️ **Correction (2026-09-04)**: this document previously drew U10 LM5050-1 as the **front end** of `+BATT`, **one stage too early**.
> Sorting the symbols on the Power sheet by their actual X coordinates:
> `+BATT(153) → C19(219) → U9 AP63205(302) → L4(392) → Q2(558) → U10 LM5050-1(568) → +5V(635)`
> - **U10 and Q2 are on the `+5V` rail after the buck** (paired with the "Switch off detection" on IO_06),
> not reverse protection at the battery input. **The conclusion "the servos run on raw `+BATT` battery voltage" is unaffected.**

**Key point: the servos run on `+BATT`, not `+5V`.** There is only one buck (U9) and one
inductor (L4) on the board; the 5 V rail is for the Raspberry Pi, and 2 A would not drive 15
XL330s anyway. This is the schematic-level evidence for
[the XL330 being run over-voltage](actuator-selection.md#-the-voltage-truth-the-xl330-is-run-over-voltage).

Incidentally, the HAT's input side is designed for high voltage (`C19 10µF/63V`, `C20 100nF/50V`,
with the note `Power 24V 5A i.e. 7s/25c, from 21V to 29V`) - because it is upstream's
**general-purpose HAT** for "small/medium size robots", not a board specific to this robot.
So the servo bus voltage is entirely whatever battery you plug in; this robot uses a 2S pack.

**2. Opening the KiCad project needs a second repository.**

The HAT repository has **no** `sym-lib-table`, no `fp-lib-table` and no `.pretty` directory, yet the
schematic references `Library_Pollen`, `LCSC_parts_lib` and `Lib_Pollen`. Those live in
[`pollen-robotics/lib_KiCAD`](https://github.com/pollen-robotics/lib_KiCAD)
(`Symbols/Library_Pollen.kicad_sym`, `Footprints/Lib_Pollen.pretty`, `LCSC_parts/`).

Without it the project opens as a field of unresolved symbols.
**Not needed if you only want to fabricate** - use the Gerbers in `production/` directly.

**3. Four layers, 118 placements, assembly service required.**

The `kicad_pcb` layer stack is `F.Cu / In1.Cu / In2.Cu / B.Cu`. The BOM is 47 lines and 123 parts,
including a **VQFN-32 codec** and an **LGA-16 BMI088** - hand soldering is not realistic; order it
with SMT assembly.

Five DNP lines: `C25`, `R10/R11`, `R16/R17/R41`, `R36/R37`, and **`U4`**.

**4. `U4 = CAT24C32` is DNP → this is not a self-identifying HAT.**

The EEPROM position is left empty, so the board does not follow the `hat-plus-specification`
auto-detection flow. The device-tree overlay has to be applied by hand.

### Also: the Dynamixel side is dual-standard

| Ref | Interface | Note |
|---|---|---|
| `J13 / J14` | **TTL 3P** (JST EH 2.5 mm) | The XL330 servos use this |
| `J3 / J11` | **RS-485 4P** (JST EH 2.5 mm) | driven by `U8 = SIT3088E` |
| `TH1` | 100R thermistor | overcurrent protection |

So the board drives **both TTL and RS-485 Dynamixels, and Feetech servos**, with a cable change.

### Also: this is not a single-robot board

It is a general-purpose HAT for small and medium robots. Three known users:

- The upstream robot this project replicates
- Upstream's own **Grabette / Casquette** (running on a Pi 4)
- Third-party **[`Rhoban/microban`](https://github.com/Rhoban/microban)** - a 19×XL330 + Pi Zero 2W
  + 2×18650 biped with a **complete public BOM, assembly and printing guide** (~$567 total).
  Worth cross-checking when sourcing parts.

> One line from `Rhoban/microban`'s BOM is worth remembering:
> *"Unlike the other components, the RPI Robot Hat is not an off-the-shelf part: it is an
> open-source board that you need to have manufactured."*
> - **open source ≠ purchasable.** You still have to fabricate it.

### Reverse-engineered conclusions checked against the official BOM

| Derived here | Actual official BOM | Result |
|---|---|---|
| Audio codec @ `0x18` | `U2 = TLV320AIC3104IRHBR` | ✅ |
| BMI088 @ `0x19/0x68`, fitted but unused | `U11 = BMI088` | ✅ |
| Pull-ups "a single 10k pair, **R12/R13**" | `R12, R13 = 10k` | ✅ **exact designators** |
| "Stemma **J5** connector" | `J5–J8 = JST SH 1 mm 4P` | ✅ |
| Pi Zero 40-pin form factor | `J4 = 2x20 rasp HAT zero SMD` | ✅ |

### What the source code could **not** reveal

| Part | Function |
|---|---|
| `U1 = PAM8406D` | Class-D audio amplifier |
| `MK1` | **On-board MEMS microphone** (LCSC `C7587901`). ⚠️ The official BOM's Value field only says `Microphone_MEMS`, and the schematic note only says "Onboard Mic."; **no part number is given**. The LMA2718 previously written here had no source and has been withdrawn |
| `U10 = LM5050-1` | Ideal-diode controller (reverse protection / OR-ing) |
| `AP63205` | Buck converter |
| `CAT24C32` | EEPROM - identity required by the Raspberry Pi HAT+ specification |
| `J1/J2/J9 = Wago-2` | Screwless terminals: external speaker and second microphone |
| `J3/J11`, `J13/J14` | Dynamixel 4P / 3P connectors (JST EH 2.5 mm) |

Two more facts from the official README that the source code does not carry:

- **Input range 5–28 V**, designed to be **powered through the motor connector**
- Dynamixel **TTL and RS485 both supported** (cable change only; drives Feetech servos too)

### What is on it

| Part | I²C address | Notes |
|---|---|---|
| **TLV320AIC3104** | `0x18` | TI audio codec, I²S data + I²C control |
| **BMI088** | `0x19` / `0x68` | **Actually fitted, but unused by software** (BOM `U11`; the comments say "dormant", "unused but still connected"). This is the second of the "two IMUs" the press mentions |
| **ToF** | `0x29` or `0x52` | Not on the board; via the **Stemma/Qwiic J5** header. The firmware supports **both VL53L5CX and VL53L8CX**, identified by revision ID |

- I²C bus: header **pins 3 and 5** (`GPIO1_A0` = SDA, `GPIO1_A1` = SCL)
- Bus speed **400 kHz** - capped by the codec and the BMI088; the VL53L5CX alone would
  take 1 MHz
- Pull-ups: **a single 10 kΩ pair, R12/R13**
- Audio clocks: **12 MHz** fixed MCLK, I²S system clock **12.288 MHz** (256 × 48 kHz)
- **The robot's internal power runs through this board** (battery → HAT → main board)

### ⚠️ A trap they hit themselves, documented in the overlay

The RK3566's `i2c3` controller runs in its **M1 pin mux** in the vendor DTB
(`GPIO3_B5/B6`, next to the USB-C port), where it serves the **FUSB302 USB-C PD
controller**. The pins the HAT needs - 3 and 5 - are that same controller's **M0 pin mux**.

Their overlay re-muxes the controller to M0 and disables the fusb302 node. Consequences:

- **USB-C PD negotiation is lost**
- But the FUSB302's power-on defaults already present Rd on both CC lines
  (`SWITCHES0 = PDWN1|PDWN2`), so USB-C chargers - PD or dumb - **still deliver 5 V**,
  and the board only ever wanted 5 V
- In-robot power comes from the battery through the HAT regardless
- maskrom flashing is ROM code and is unaffected

> An earlier revision used **bit-banged I²C** (`i2c-gpio-pihat`), which burned CPU.
> Moving to the hardware controller is what made the **15 Hz ToF stream** affordable.
> The two modes are mutually exclusive; `install.sh` selects between them with
> `MICRODUCK_I2C_MODE=hw|bitbang`.

### Stable device node

`/dev/i2c-3` is symlinked to **`/dev/i2c-pihat`** by a udev rule, so consumer code works
unchanged in either mode.

---

## 5. The Servo Bus

| Item | Value |
|---|---|
| Motors | **Dynamixel XL330 × 15** |
| Protocol | **Dynamixel Protocol V2** |
| Baud rate | **1 Mbps** (EEPROM register `baud_rate = 3`) |
| Serial port | `/dev/ttyS2` |
| Rust crate | [`rustypot`](https://github.com/pollen-robotics/rustypot) - upstream's own |
| Control loop | **50 Hz** |

### ID assignment

```
Left leg    20  21  22  23  24    hip_yaw / hip_roll / hip_pitch / knee / ankle
Neck+head   30  31  32  33  34    neck_pitch / head_pitch / head_yaw / head_roll / mouth
Right leg   10  11  12  13  14    (mirror of the left)
IMU board   200                   imu_to_dxl v2
```

> **The 15th servo is the mouth (ID 34, index 9).** Every alpha policy is
> `obs[1,61] → actions[1,14]`, and the action vector **skips that index** - the mouth is
> driven by higher-level logic, not by the policy.
>
> This ID scheme is **identical to Open Duck Mini v2** (20-24 / 30-33 / 10-14), with only
> the extra 34 added. The lineage shows.

---

## 5b. Communications, Item by Item

### Main bus: single-wire half-duplex TTL UART - **not RS-232, not RS-485**

| Item | Value | Evidence |
|---|---|---|
| Physical layer | **3-wire TTL half-duplex** (data + VDD + GND) | XL330 spec: 3-pin JST, TTL |
| Logic level | **3.3 V** | RK3566 IO level |
| Protocol | **Dynamixel Protocol V2** | `.with_protocol_v2()` |
| Rate | **1 Mbps** | `BAUD_RATE = 1_000_000`, EEPROM `baud_rate = 3` |
| Port | `/dev/ttyS2` = RK3566 **UART2, M0 pin mux** | `robotd.toml`, `uart2-m0` overlay |
| Devices on the bus | **16**: 15 servos + 1 IMU board | `ids = [200, 20..24, 30..34, 10..14]` |
| Per transaction | one `sync_read` covering all 16 devices, registers **124–136** | `bus.rs` |

> ❗ **It is not RS-485.** RS-485 is a differential pair, used by Dynamixel's XM/XH series
> (4-pin). The XL330 is **single-wire half-duplex TTL** (3-pin). Searching the whole
> repository for `rs485|rs232|half-duplex|direction pin` returns **zero hits** - there is
> no direction-control GPIO in the code, which means **direction switching is done in
> hardware by a self-steering circuit**, and that circuit lives on the HAT.

### ⚠️ The Armbian trap: UART2 has a login console on it by default

> From `robotd-design.md`: Armbian runs `serial-getty@ttyS2` by default, and `agetty` holds
> the port. You must `systemctl mask serial-getty@ttyS2`. Upstream found this with
> `fuser -v /dev/ttyS2` naming `agetty`.

### Every interface at a glance

| Interface | Used for | Parameters |
|---|---|---|
| **UART2 (`ttyS2`)** | servos + IMU board | 1 Mbps, TTL half-duplex |
| **I2C3 (M0, pins 3/5)** | audio codec / ToF / (the unused BMI088) | 400 kHz |
| **I2S3 (`i2s3_2ch`)** | audio data | MCLK 12 MHz, sysclk 12.288 MHz |
| **MIPI CSI** | IMX219 camera | I²C control at `0x10` |
| **Bluetooth** | gamepad (`padd`), phone app (`btd`) | on the Radxa Zero 3W module |
| **Wi-Fi** | WebRTC video, provisioning (`configd`) | on-module |
| **USB-C** | power + maskrom flashing | PD negotiation sacrificed by the overlay |
| **Unix sockets** | JSON-RPC between daemons | not hardware |

---

### Feetech STS/SCS protocol comparison

A common question: **after switching to Feetech servos, does the "IMU as the 16th device on the bus" scheme still hold?**

**It does.** Feetech STS/SCS has its own bulk-read instruction, `SYNC READ` (`0x82`), used the same way as Dynamixel's.
The only difference is **how the replies come back**.

| | Dynamixel V2 (XL330) | Feetech STS/SCS |
|---|---|---|
| Physical layer | half-duplex single-wire TTL, 3 wires, 1 Mbps | **identical** |
| Connector | JST EH 2.5 mm | 5264, also 2.5 mm (⚠️ same pitch, but confirm the housing latch details on real parts) |
| Header | `FF FF FD 00` | `FF FF` |
| Checksum | CRC-16 | `~sum` (inverted sum) |
| Bulk read | `sync read` (**what upstream actually uses**)<br>there is also `fast sync read` 0x8A, but it is **not used** | **`sync read` 0x82** |
| Reply format | **one separate packet** per device | **one separate packet** per device |
| Bus turnarounds per cycle | 17 ⚠️ | 17 ⚠️ |
| ID range | 0–252 | 0–253 (register 5) |
| Baud-rate setting | register `baud_rate = 3` | register 6, `0 = 1M` |

**Evidence**: `scservo_sdk/group_sync_read.py` - `syncReadTx()` sends one instruction packet,
`syncReadRx()` reads back a buffer, and `readRx()` splits it packet by packet by matching the `[0xFF, 0xFF, scs_id]` header:

```python
result, rxpacket = self.ph.syncReadRx(self.data_length, len(self.data_dict.keys()))
while (rx_index + 6 + data_length) <= rx_length:
    if (headpacket[2] == 0xFF) and (headpacket[1] == 0xFF) and headpacket[0] == scs_id:
        break
```

> ⚠️ **"17 turnarounds" is a protocol inference (1 instruction + one reply from each of 16 devices), not a measurement.**
> Converting that to milliseconds depends on tri-state buffer switching speed, inter-packet gaps and the register length actually read - measure it with an FE-URT-1 once the parts arrive.

#### Key correction: upstream does **not** use `fast sync read`

Protocol V2's `fast sync read` (`0x8A`) really can merge every reply into one packet and cut bus turnarounds to 2.
**But the upstream runtime does not use it** - searching the whole repository for `fast_sync_read` / `0x8A` returns **zero hits**;
`duck-control/src/bus.rs:236` calls the ordinary `sync_read_raw_data`:

```rust
.sync_read_raw_data(&self.ids, READ_ADDR, READ_LEN)
.map_err(|e| IoError::Bus(format!("combined imu+motor sync_read: {e}")))?;
```

This is also consistent with the line in `model.rs:84-86`, "500 µs **per device** × 16 devices = 8 ms" -
**if the replies were merged into one packet, the per-device turnaround delay would not be multiplied by 16.**

**So the reply mechanism is the same on both sides**: one instruction packet goes out, and every device answers with its own status packet.
Feetech is not "missing bulk read", and Dynamixel is not using its faster variant.
The real differences come down to two things: **packet format**, and the factory default below.

#### ⚠️ A counter-intuitive finding: Feetech wins on factory-default delay

STS memory-table entry `7 (0x07)`, **Return Delay Time**: **default 0**, with the remark **"Not functional on STS"**.

The XL330 ships at `250`, i.e. **500 µs per device** - from `duck-control/src/model.rs:84-86`:

> `return_delay_time` ... the XL330 ships at 250, which is 500 µs of turnaround **per device**.
> Across **16 devices** that is **8 ms per tick - 40% of a 20 ms budget**

Upstream has to write that register to 0 to eliminate it. **Feetech has no such overhead by default**; its extra turnaround cost is largely cancelled by this one item.

#### Another Feetech register worth setting

STS memory-table entry `8 (0x08)`, **Response Level**, default **1** (every command is acknowledged).
Set to **0**, only reads and pings reply, and ordinary write instructions no longer consume bus time -
the same class of action as upstream writing `return_delay_time = 0` on the XL330.

> **Factory defaults are for the general case; a high-rate control loop has to tune them itself.**

---

### Alternative part: Feetech HD-1910-C001

Item-by-item comparison of the manufacturer datasheet (provided during the 2026-09 pre-sale stage) against the XL330-M288-T:

| Item | XL330-M288-T | **HD-1910-C001** | Verdict |
|---|---|---|---|
| **Voltage range** | 3.7 – **6.0** V (5.0 recommended) | **5 – 8.4 V** | ✅ the 6.6–8.2 V bus **falls entirely within the rated range** |
| **Dimensions** | 20 × 34 × 26 mm | **34 × 20 × 23 mm** | ✅ same first two dimensions, **3 mm thinner** in the third |
| **Mass** | 18 g | **22.5 ± 2 g** | ⚠️ +4.5 g each, **15 units = +67.5 g** |
| **Stall torque** | 0.52 N·m @5V / 0.60 @6V | **10 kg·cm = 0.98 N·m** | ✅ nearly double |
| No-load speed | ~103 RPM @5V | 110 RPM (0.09 s/60°) | comparable |
| Rated load | - | 3.0 kg·cm = 0.294 N·m | |
| **Stall current** | ~1.5 A @5V | **1.8 A** | ⚠️ see the current budget below |
| Rated current | - | 500 mA | |
| No-load / idle current | - | 140 mA / 21 mA | |
| Housing | - | PA + Fiber | |

**The voltage row flips the qualitative verdict on the two routes.** On the same 2S supply:

- **The XL330 runs over-voltage** (rated ceiling 6.0 V, actual 6.6–8.2 V, roughly 37% over) -
  Upstream trades heat and lifetime for torque; that is a compromise, see [Actuator selection, the voltage truth](actuator-selection.md#-the-voltage-truth-the-xl330-is-run-over-voltage)
- **The HD-1910 is within rating** - the 6.6–8.2 V under-load span sits entirely inside 5–8.4 V; there is no over-voltage.
  ⚠️ **But mind the margin**: a **fully charged pack is 8.4 V**, exactly the HD-1910's upper limit, i.e. **zero margin**.
  This repository requires "at least 2× working voltage" of its self-built boards; a servo obviously cannot meet that,
  but at least it is operating within the manufacturer's rating, while the XL330 is operating outside it

> ⚠️ **No comparison against the MJCF `forcerange` here** - that is a MuJoCo simulation force limit, not a manufacturer figure,
> and lining it up against a manufacturer's stall rating is wrong; see the note under that table in [Actuator selection](actuator-selection.md).
>
> Also distinguish: the HD-1910's **0.98 N·m is stall torque**; **rated load is 3.0 kg·cm = 0.294 N·m**.

#### ⚠️ Four items the datasheet still lacks (get written confirmation from the manufacturer)

| Missing | Why it matters |
|---|---|
| **The voltage at which 10 kg·cm was measured** | The most important one. If it is @8.4 V, torque falls to roughly 0.7 N·m when the pack drops to 6.6 V. **This directly determines the torque model for policy retraining** (BAM's `vin_range` and torque curves depend entirely on it) |
| **Gear ratio** | The XL330 is 288.4:1. Gear ratio is a key item in the BAM actuator-identification model |
| **Encoder resolution** | Verbally stated as 12-bit, not listed in the datasheet; needs written confirmation |
| **Backlash** | The MJCF has dedicated `*_backlash` modelling variants; this parameter affects sim-to-real transfer |

#### ⚠️ Current budget: a check that should always have been done, and was not

**This is not a new problem introduced by the Feetech route.** Stall **1.8 A × 15 = 27 A**,
while the XL330's **~1.5 A × 15 = 22.5 A** equally far exceeds four connectors × 3 A = 12 A.
The HAT's Dynamixel connectors carry the note **"3A max"**, and J13/J14 also have TH1 (100R thermistor) in series.

Real walking never stalls every servo at once - the official runtime is about 1 hour, the NP-F550 holds about 2200–2900 mAh,
which back-computes to an average of roughly 2.5 A. But **standing up, self-recovery after a fall and kicking a ball put several joints at high current simultaneously**.

**With 15 servos split across four connectors, the current allocation per port and the wire gauge need to be re-checked.**

---

## 5c. Why This Needs a Linux SoC and Not an STM32 or ESP32

The main board has to do all of this at once:

| Task | Load |
|---|---|
| ONNX Runtime policy inference | `obs[1,61] → act[1,14]` @ **50 Hz** |
| WebRTC video | 720p30 H.264, **Rockchip MPP hardware encoder** |
| RKNN NPU object detection | `duck_detect.rknn` @ 2 Hz - a **thermal limit**, 95 °C flat out |
| GStreamer pipeline + congestion control | `rtpgccbwe` costs 7.6 % of a core |
| Bluetooth gamepad + phone app + Wi-Fi | BlueZ stack |
| Signed firmware update / rollback | `updaterd` |

**An MCU cannot do this.** WebRTC plus H.264 hardware encoding plus ONNX inference alone
requires Linux, a hardware encoder and an NPU.

Hence the choice: **RK3566, quad Cortex-A55 + Mali-G52 + NPU, running Armbian**.

> 📌 Note, though, that **the prototype ran on a Raspberry Pi Zero 2W**. From
> `robotd.toml`: the 50 Hz control loop *"is inherited from the prototype, where it was
> chosen on a Raspberry Pi Zero 2W. It has never been re-derived on the Radxa."*
> Open Duck Mini v2 still runs on a Pi Zero 2W today - because it does no vision and no
> WebRTC.

### So what MCU is on the `imu_to_dxl` board?

**Not in the repository** - that is the board's own firmware, which is not in this open-source repository.
But its job defines the requirements:

- Act as a **Dynamixel Protocol V2 slave** (answer `sync_read`, ID 200, register 124)
- Read the **LSM6DSV16X** (SPI or I²C)
- Sustain **1 Mbps UART** with half-duplex direction switching
- Pack the SFLP quaternion into fp16

**An STM32G0, STM32G4, CH32V203 or ESP32 are all sufficient.** This is exactly the place
where you are free to choose - as long as it behaves like a Dynamixel slave on the wire,
the host does not care what is inside.

---

## 6. Power and Battery

| Item | Value |
|---|---|
| Battery | **Sony NP-F550** (L-series camcorder pack), **2S Li-ion** |

> ⚠️ **It is an NP-F550, not an F970.** The upstream mesh is named `np_f970`, but its bounding box
> measures **70.8 × 38.6 × 20.6 mm** - NP-F550/F570 size - and the source only ever names the F550.
> A real NP-F970 is ~60 mm thick and ~300 g: **it does not fit and blows the weight budget.**
> See [BOM](../BOM.md).
| Nominal | 7.2 V |
| Full, under load | **8.2 V** |
| Empty, under load | **6.6 V** |
| Fuel gauge | **none** |
| ADC | **none** |

### How the voltage is measured

> From the source: *"There is no fuel gauge and no ADC. The only measurement available is
> what the servos report as their own supply."*

The pack voltage is read **over the Dynamixel protocol, from what the servos report as
their own supply** - the battery as seen through the bus. That means the reading **sags
under load and recovers at rest**, so the 6.6–8.2 V span is a **usable-under-load range**,
not the cells' chemical range.

When the battery EMA (about a 10-second time constant) reaches 6.6 V, the robot
**sits down gracefully and powers off**.

> Good news for anyone reproducing this: **you do not need any battery-monitoring circuit
> at all.**

---

## 7. Sensors

### ToF depth

| Item | Value |
|---|---|
| Chip | **VL53L5CX** or **VL53L8CX** (ST multizone ranger; two generations, one interface) |
| Address | `0x29` |
| Bus | the HAT's i2c3 |
| Frame rate | 15 Hz |

Used for the `theremin` feature: the distance of a hand in front of the beak maps to a
pitch, and the mouth opens with it. Playable band 0.10–0.70 m.

### Camera

| Item | Value |
|---|---|
| Sensor | **IMX219** (= Raspberry Pi Camera v2) |
| I²C address | `0x10` |
| Device-tree overlay | `radxa-zero3-rpi-camera-v2` |
| Mounting | **rotated 90°** - `mediad/src/main.rs:82` defaults `--rotate` to 90; the comment reads<br>"the head camera is mounted **a quarter turn off**, and this is the one place that fact is written down".<br>⚠️ The **180°** in `docs/project/media-bringup.md:472` is stale **alpha-unit** data |
| Sensor mode | pinned to 1920×1080@30 (its boot-default mode caps capture at 21 fps) |
| Default output | 720p30, 2 Mb/s |
| Encoding | GStreamer + **Rockchip MPP hardware encoder** → WebRTC |
| HFOV | ~62° |

### Audio

| Item | Value |
|---|---|
| Codec | TLV320AIC3104 |
| ALSA card name | `aic3104` |
| Microphone | on **Mic3R** (mono, right PGA); every other input is switched off |
| Output | line out, volume 9/9 |

---

## 7b. The NPU and On-Board Vision

> Compiled from upstream `docs/project/npu-bringup.md` and `duck-detect/`.
> It is currently the only material that states plainly what the RK3566's NPU can actually do.

### NPU specification

| Item | Value | Source |
|---|---|---|
| Compute | **0.8 TOPS, INT8, single core** | opening of `npu-bringup.md` |
| Device-tree node | `npu@fde40000` | Armbian ships it `status = "disabled"` |
| Runtime | rknn-toolkit2 runtime, `librknnrt.so` | driver 0.9.8 / runtime 2.3.2 (measured) |

### ⚠️ Two hard constraints that will stop a replica dead

**1. The driver exists only in the vendor kernel. Mainline has none.**

> Upstream: *"The driver is the gate: it is part of the vendor kernel, mainline has none,
> and nothing in userspace can work around its absence."*

This is far more serious than "the NPU is off by default". Swap in a mainline-kernel distro -
which most official Debian/Ubuntu images are - and **the NPU simply is not there, with no
userspace workaround**. The OS image is not a free choice when reproducing this robot.

**2. Armbian disables the NPU node on every Radxa Zero 3.**

So a stock board has the hardware, the kernel and the driver, and still **no NPU**.

```bash
# Upstream runs this from the preinstall hook on every robotctl update, non-fatally
sudo sh /opt/robot/daemon/current/scripts/setup-npu.sh
# writes the overlay -> reboot required -> confirm with:
dmesg | grep rknpu
```

Run the copy **inside the release**, not `/usr/local/sbin/robot-setup-npu`: the overlay source
lives beside the script, and the standalone copy has nothing beside it on a first run.

### The duck detector

The model is trained in a separate repository, `pollen-robotics/duck_detector`, and arrives here
already quantised as `.rknn`.

> ⚠️ **That repository is not public** (404 as of 2026-09-04). Upstream docs reference it, but the
> training code is not obtainable - only the finished `.rknn`. Training your own means building a
> YOLO pipeline from scratch.

| Item | Value |
|---|---|
| Network | `yolo11n` @ **320×320** |
| Classes | **1** (the duck) |
| Training set | **150 frames from 3 sessions** |
| mAP50 | **0.976** on a held-out session |
| Size after INT8 quantisation | **3.9 MB** |
| Quantisation loss | 2 of 2 detections kept at 95% box overlap vs the float model, on the desk |

> 0.976 from 150 frames - single class, fixed subject, constrained scene. That data
> requirement is good news for anyone reproducing this.

### Measured performance (Radxa Zero 3, paced 2 Hz, 30 frames over 3 passes)

| Item | Measured | Note |
|---|---|---|
| Latency p50 / p95 | **25.7 ms / 58.4 ms** | inference plus decode, not JPEG decoding |
| CPU per frame | 20.7 ms | **not the NPU's cost** - see below |
| SoC temperature | **63 °C** | at the end of a paced run |

**That CPU figure invites misreading.** The latency column times `infer` + `decode`; the CPU
column is the whole loop's process CPU divided by frames, so it **also carries `letterbox_rgb`**
- a 1280×720 → 320×320 resample that runs on the CPU and is not in the latency column at all.
Whether the remainder means `rknn_run` busy-waits (charging NPU wait to the CPU) is not yet known
upstream either.

> At 2 Hz it is **4% of one core** either way. But before anyone quotes that as the price of
> perception, the two should be measured apart.

For why the rate is 2 Hz, see [§8, Two engineering details worth stealing](#two-engineering-details-worth-stealing)
- it is a **thermal limit, not a preference**; running flat out reaches 95 °C.

### Three engineering decisions worth stealing

**1. `dlopen`, not link.** `librknnrt.so` is a vendor blob in no Debian suite, and a crate that
linked it could not be cross-compiled in CI. The cost is `duck-detect/src/rknn.rs`; the benefit is
that `cargo board --bins` still works on a laptop. `robotd` reaches ONNX Runtime the same way.

**2. Let the runtime dequantise.** A quantised model's output tensor is int8 with a scale and a
zero point. `rknn_outputs_get` will convert to float if asked, and upstream asks - the alternative
is carrying the scale into the decoder and **getting it wrong once, quietly**.

**3. Triage in the order that matters: does it run → does it still see → what does it cost.**
`duck-bench` reports in exactly that order. A model that runs and detects nothing looks exactly
like one that works.

> ⚠️ **A quantised model's scores are on their own scale.** The float model's 0.5 is not this
> model's 0.5. When it detects nothing, try `--threshold 0.2` before believing the conversion
> is broken.

### What is still missing

**Nothing on the robot can get a frame.** `mediad` has a raw NV12 tee branch that exists precisely
for this, but **no IPC exposes it** - which is also why capturing a dataset has to stop `mediad`
to take the camera.

Upstream names two ways forward, not exclusive: add a `media.frame` call that answers with one
frame; or put the detector inside `mediad`, subscribing to the raw branch, running at a few Hz and
publishing detections on the state stream.

> The second is where it ends up: **perception next to the sensor, deriving features rather than
> shipping pixels.**

### What this means if you are reproducing it

1. **The OS image is not a free choice** - it must carry the Rockchip vendor kernel (Armbian family)
2. First thing after you get a board: **enable the NPU node and reboot**, or every inference runs on the CPU
3. Training your own model starts at roughly **150 frames** for usable accuracy - a lower bar than expected
4. Do not plan on pulling frames off the robot for your own work yet - **upstream has not finished that path**

---

## 8. Software Parameters You Must Match

| Parameter | Value | Notes |
|---|---|---|
| Control loop | **50 Hz** | inherited from the Pi Zero 2W prototype; **never re-derived on the Radxa** |
| Policy interface | `obs[1,61] → actions[1,14]` | checked at load; the older 51-D family is refused |
| `action_scale` | 0.9 (walk) / 0.8 (roller) | |
| Position P gain | **200** | ×0.8 while standing |
| Action low-pass | head **0.5** / legs **0.7** | **must match training**, or transfer degrades |
| Voltage adaptation | off by default | when on: `scale × (7.4 / measured EMA)`, clamped 6.0–9.5 V |

### Two engineering details worth stealing

**1. Predictive soft landing (`limp_fall`)**

It does not wait for the fall. Projected gravity rotates with the trunk, so its rate of
change is exactly `-(ω × g)` - and the gyro in that same 12-byte IMU block is used to
extrapolate **300 ms** ahead. When the robot is **already** tilted past about 26°,
**is still tipping rather than recovering**, and the extrapolation lands past the
threshold, the gain drops from 200 to **50** so the joints give way instead of fighting
the floor, and the robot **arrives limp**. Once it has gone still - judged from the gyro,
not a timer - the pose is ramped back to standing over 600 ms, and only then handed back
to the standing policy.

> The rationale in the source is worth quoting: the standing policy is *"a good
> stand-up-er and a bad faller"*. From a still robot, face down or face up, it gets back
> on its feet cleanly; out of a dynamic fall it tries and fails and tries again, at
> walking gain, against the floor - and the motors pay for every attempt.

**2. The 2 Hz detection rate is a thermal limit**

> From the source: *"2 is a thermal limit, not a preference."* Flat out it reaches
> **95 °C** and the CPU throttles to **408 MHz** - a robot that walks badly in order to
> see well.

---

## 9. What It Takes to Reproduce This Electronics Stack

### ✅ Buy off the shelf

| Part | Model | Notes |
|---|---|---|
| Main board | **Radxa Zero 3W** | stock module, **not custom** |
| Servos | Dynamixel XL330 × 15 | |
| Battery | **Sony NP-F550** + holder | common camcorder pack, accessories everywhere. **Not the F970 - it does not fit** |
| Camera | Raspberry Pi Camera v2 (IMX219) | |
| ToF | VL53L8CX module (Stemma/Qwiic) | |

### 📥 One board you simply download

**RPI Robot HAT - do not draw it.**
[`pollen-robotics/elec_RPI_Robot_HAT`](https://github.com/pollen-robotics/elec_RPI_Robot_HAT)
(Apache-2.0) ships a `production/` folder with Gerbers, BOM and pick-and-place. Order it as is,
with SMT assembly. Note it is a **4-layer** board.

If you want to simplify (no microphone, no speaker), you can also skip it entirely - **but you cannot drop it without replacing what it does**:

- **The servo bus's half-duplex direction circuit is mandatory** (the U5/U6/U7 tri-state buffer group; §5b above established that "there is no direction-control GPIO in the code, that circuit lives on the HAT") → you need a separate ST/SC-series bus adapter board
- Power distribution → an off-the-shelf 5 V UBEC
- ToF → straight onto i2c3

The cost is losing on-board audio and Pi HAT+ identification. Sourcing: see [Electronics sourcing list §6](electronics-sourcing-list.md#6-the-two-pcbs).

### 🔧 The one board you must build yourself

**`imu_to_dxl`** - no public project exists anywhere, so this is the **only board that has to be
rebuilt from scratch**. LSM6DSV16X + a small MCU (Dynamixel V2 slave) + a half-duplex TTL
transceiver. The protocol and 12-byte register layout are given in full above; implement to that.

### ⚠️ Traps to plan for

1. **i2c3 collides with the FUSB302** - using the hardware I²C on pins 3/5 costs USB-C PD
   negotiation (plain 5 V charging still works). See section 4.
2. **The NPU ships disabled** - Armbian does not enable it; flash the overlay and reboot
   before running RKNN models.
3. **The camera is mounted a quarter turn off** - set `rotate=90` and let the hardware encoder
   do it; do *not* use `videoflip`, which is a full CPU pass over every frame.
4. **The 50 Hz loop was never validated on the Radxa** - upstream says so itself; the
   number came from the Pi Zero 2W prototype.

---

## 10. Conclusion: This Electronics Stack Can Be Reproduced

An earlier version of this document concluded "the RK3566 carrier is custom and
unobtainable, the PCB is a hard wall." **That conclusion needs correcting:**

- The main board is an **off-the-shelf Radxa Zero 3W**, not a custom carrier
- **The HAT board is fully published upstream** (KiCad + Gerbers + BOM) - no need to draw it
- What remains, `imu_to_dxl`, has very few components and its protocol is now
  fully recovered - it is the only board you have to build

**What actually remains is software.** The Rust runtime is open source (Apache-2.0) but
bound to the Radxa Zero 3W's specific wiring - so if you build around the same main board,
**the runtime runs as-is.**

> Sources: `duck-control/src/{model,imu,bus}.rs`, `robotd/src/main.rs`,
> `deploy/robotd.toml`, `deploy/audio/*.dts`, `deploy/overlays/*.dts`,
> `tof/src/*.rs`, `mediad/src/*.rs`, `docs/design/robotd-design.md`,
> `docs/project/media-bringup.md` - all in `pollen-robotics/microduck`.
