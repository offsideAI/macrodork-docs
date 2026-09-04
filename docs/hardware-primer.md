# Hardware Primer: Board by Board

> This document answers one question: **how many boards are there in the robot, and what does each one do.**
>
> How it divides the work with the other two documents:
> [Hardware Teardown](hardware-teardown.md) is the **derivation and the evidence trail** (for people who want to verify),
> [Hardware Spec Sheet](hardware-spec-sheet.md) is the **one-page spec table** (for people who already know the system).
> This one is the **beginner's walkthrough**, written on the assumption that you are new to the project.
>
> Every conclusion can be re-checked by you - the last section, [How to check it yourself](#9-how-to-check-it-yourself-five-things-to-do-before-you-replicate),
> explains exactly how.

---

## 1. The big picture first: five modules, only two you make yourself

```
                    ┌─────────────────────────────────────────┐
                    │  Head (the jaw_soft body in the MJCF)     │
                    │                                          │
   MIPI CSI ────────┤  (4) IMX219 camera + M12 lens            │
   (about 13 mm,    │        ↕ same rigid body, no joint between│
    does not cross  │  (1) Radxa Zero 3W    main board         │
    the neck)       │        ↕ stacked 7.3 mm apart, 40-pin    │
                    │  (2) RPI Robot HAT    power / audio / bus │
                    │        └─ Stemma port ──► (5) ToF module  │
                    │  Speaker                                  │
                    └──────────────┬──────────────────────────┘
                                   │
                    ═══════════════╪══════ through the 3-DoF neck ══════
                     servo bus (1 pair) │ battery feed (+BATT)
                                   │
                    ┌──────────────┴──────────────────────────┐
                    │  Trunk (trunk_base)                       │
                    │   two hip_yaw XL330s - fill most of the   │
                    │   cavity                                  │
                    │   (3) imu_to_dxl board (hangs on the bus) │
                    └──────────────┬──────────────────────────┘
                                   │
                     NP-F550 battery ─┘ hangs outside, low on the back
                     about 40 mm of its 71 mm length sits outside the
                     shell, clamped from outside by two power_support parts
```

| # | Module | In one sentence | How you get it |
|---|---|---|---|
| (1) | **Radxa Zero 3W** | The brain. Runs Linux, the neural-network policy, vision | 🛒 Buy |
| (2) | **RPI Robot HAT** | Power distribution + audio card + servo bus interface | 🏭 **Officially open source, fab it yourself** |
| (3) | **imu_to_dxl** | Disguises the IMU as a fake servo | ✏️ **You have to draw it yourself** |
| (4) | **IMX219 camera** | Eyes | 🛒 Buy |
| (5) | **ToF module** | 8x8-zone ranging, not a lidar | 🛒 Buy |

> ⚠️ **Three common misconceptions**
> 1. **There is no lidar.** The ToF is a multi-zone ranging module (4x4 or 8x8 zones), not a radar.
> 2. **Audio is not a separate module.** Codec, amplifier and microphone are all on the HAT.
> 3. **The main board is in the head, not the trunk.** This is the easiest one to get wrong, and it directly determines how long a ribbon cable you buy.

---

## 2. (1) Main board · Radxa Zero 3W

**What it does**: runs Armbian Linux, runs the Rust runtime `robotd`, runs ONNX policy inference, runs vision.
In one sentence - **everything except driving the motors is its job**.

| Item | Value |
|---|---|
| SoC | Rockchip **RK3566**, quad-core Cortex-A55 @ 1.6 GHz |
| NPU | 0.8-1 TOPS INT8, node `npu@fde40000`, **disabled by default in Armbian**, needs an overlay |
| Form factor | **65 x 30 mm**, Raspberry Pi Zero form factor, 40-pin header |
| OS | Armbian **headless** image |

**Why this board and not a Raspberry Pi**: it is an **off-the-shelf module**, not a custom carrier - this matters a lot,
because it means the replica does not need a custom main board. The device tree hard-codes `compatible = "radxa,zero-3w"`.

**Which of the 40 pins it uses** (extracted from the official HAT schematic):

| Pin | Use | Linux device |
|---|---|---|
| **GPIO14 / GPIO15** | **Dynamixel UART Tx / Rx** | `/dev/ttyS2` @ 1 Mbps |
| **GPIO02 / GPIO03** | I²C - IMU + audio + Stemma | `i2c3` @ 400 kHz |
| GPIO18 / 19 / 20 / 21 | Audio PCM Clk / FS / Din / Dout | `i2s3_2ch` |
| GPIO06 | Switch-off detection | |
| GPIO22 | Interrupt pin of the BMI088 on the HAT (**unused by software**) | |
| GPIO00 / 01 | HAT identification I²C (reserved) | ⚠️ see the HAT section |
| GPIO04/05, 08/09, 10/11 | Extra Stemma/QT I²C | |
| MIPI CSI | Camera | |

**Which configuration to buy**: 2G / 16G eMMC. The reasoning is in the [Electronics Sourcing List](electronics-sourcing-list.md#which-configuration-to-buy).
⚠️ **Which configuration the official robot actually uses cannot be established from anywhere in the repository - unknown.**

---

## 3. (2) RPI Robot HAT - one board, four jobs

**This is the only board that is fully open-sourced officially** ([`pollen-robotics/elec_RPI_Robot_HAT`](https://github.com/pollen-robotics/elec_RPI_Robot_HAT),
Apache-2.0, with the KiCad project + Gerbers + BOM + pick-and-place file).

**Specs** (measured from the Gerbers): 4-layer board, **65.0 x 30.9 mm**, corner radius R3.5, BOM 47 lines / 123 parts,
of which 5 lines / 9 parts are DNP, so **113 placements** actually fitted.

### Function block 1: power distribution

```
NP-F550 battery ──► +BATT ──┬──► servos (direct, no buck)
  2S, 6.6-8.2 V             │
                            └──► U9 AP63205 + L4 6.8 µH ──► Q2 / U10 LM5050-1 ──► +5V
                                   buck, 2 A, Fsw 1.1 MHz     ideal diode + switch-off detect │
                                                                                            ├─► main board 40-pin
                                                                                            ├─► PAM8406D amplifier
                                                                                            └─► U3 XC6206P182 → +1V8 (codec)
```

**Here is a counter-intuitive fact: the servos run on raw battery voltage, not 5 V.**

The XL330 is officially rated **3.7-6.0 V, 5.0 V recommended**, and here it gets **6.6-8.2 V**.
This is not a guess, it is written straight into the schematic: the power pins of all four Dynamixel connectors J13/J14/J3/J11 go to `+BATT`,
annotated "3A max". And **the whole board has only one buck (U9) and one inductor (L4)**; that 5 V rail is for the main board
- a 2 A AP63205 could not drive 15 XL330s anyway (about 1.5 A stall each).

Details in [The voltage truth](actuator-selection.md#-the-voltage-truth-the-xl330-is-run-over-voltage).

> `+3V3` goes the other way: **the main board supplies it to the HAT** over the 40-pin header; the HAT does not generate it.

### Function block 2: servo bus (half-duplex TTL)

Bus servos like Dynamixel / Feetech are **single-wire half-duplex** - one wire both transmits and receives, switched by a direction control.

| Part | Role |
|---|---|
| **U6 `SN74LVC1G125`** | Tri-state buffer, transmit direction |
| **U7 `SN74LVC1G126`** | Tri-state buffer, receive direction |
| **U5 `74LVC1G08`** | AND gate, part of the direction logic |
| **U8 `SIT3088E`** | RS-485 transceiver (for the two 4P ports) |
| **TH1 100R** | Thermistor, over-current protection |

Direction is controlled by `Dynamixel_dir`; the official comment reads **"Dynamixel_dir is based on Tx"** - the direction is derived automatically from the transmit signal.

**Four connectors, two kinds**:

| Designator | Type | Who uses it |
|---|---|---|
| **J13 / J14** | **JST EH 3P** (TTL) | **The XL330s go on these two**, through TH1 to `+BATT` |
| J3 / J11 | JST EH 4P (RS-485) | Driven by U8, straight to `+BATT` |

> 💡 **JST EH is 2.5 mm pitch**, and Feetech servo cables are specified as **5264 terminals**, also 2.5 mm.
> On the Chinese market "5264" is basically the generic name for 2.5 mm 3P - it will very likely plug straight in, but
> check the housing latch details against real parts.

### Function block 3: audio

| Part | Role | Address |
|---|---|---|
| **U2 `TLV320AIC3104`** | Audio codec, I²S data + I²C control | i2c3 `0x18` |
| **U1 `PAM8406D`** | Class-D amplifier | |
| **MK1** | On-board MEMS microphone (LCSC `C7587901`, no part number given officially) | |
| J1 | Wago screwless terminal, to the **5 W speaker** | |
| J2 / J9 | Wago terminals, for an external microphone | |

Audio clocks: MCLK 12 MHz fixed crystal, I²S sysclk 12.288 MHz (256 x 48 kHz).

> **If you do not need recording or the speaker, this whole block can be dropped.**

### Function block 4: sensor expansion

- **J5-J8**: JST SH 1.0 mm 4P (Qwiic / Stemma QT) - this is where the ToF hangs
- **U11 `BMI088`**: ⚠️ **fitted, but the software does not use it at all**. The device tree comments literally say `dormant` and
  `unused but still connected`. When people say the robot "has two IMUs", this is the one they mean
- **U4 `CAT24C32`** EEPROM: ⚠️ **DNP, not fitted** - so this board **is not a self-identifying HAT**,
  even though the schematic says "HAT Identification: I2C add. 0x50 / Standard Class HAT+"

### You cannot buy this board, so what do you do

**Upstream does not sell it separately**, only the complete robot. Two routes:

1. **Faithful fab run** - take the official Gerbers + BOM + pick-and-place file to JLCPCB. 4-layer + SMT starts at a few hundred yuan and has a minimum order quantity.
2. **Replace it with off-the-shelf modules** - a ¥22 ST/SC half-duplex adapter board + one UBEC covers the two mandatory functions, "servo bus" and
   "power distribution", and the ToF hangs directly on i2c3. The cost is losing on-board audio. See the [Electronics Sourcing List](electronics-sourcing-list.md#6-the-two-pcbs).

---

## 4. (3) imu_to_dxl - the smartest move in the whole electronics design

**This board does exactly one thing: it disguises the IMU as a fake servo.**

It is an **STM32G031F8P6 + LSM6DSV16X** (ST 6-axis IMU) + half-duplex buffer,
and presents itself to the outside as a slave sitting on the servo bus, **ID = 200**.

### Why go to all this trouble

The intuitive approach is to wire the IMU straight to the main board over I²C or SPI. But that has a problem:

**IMU data and servo data travel two different paths, so their sample instants do not line up.**

The policy runs at 50 Hz, and every tick it needs to know "body attitude" and "15 joint angles" at the same time.
If the IMU goes over I²C and the servos over UART, there is several milliseconds of jitter between them - and jitter directly pollutes the policy input.

Upstream's answer is to **make the IMU speak the servo language too**, so the host sends **one `sync_read`** per tick
and gets back the IMU attitude + 15 servo positions together, **with naturally aligned timestamps**.

### Protocol and registers

| Item | Value |
|---|---|
| Protocol | Dynamixel **Protocol V2** |
| ID | **200** |
| Baud rate | **1 Mbps** (EEPROM register `baud_rate = 3`) |
| Start register | **124** |
| Length | **12 bytes** |

Layout of the 12 bytes:

| Offset | Content |
|---|---|
| `0..6` | gyro x/y/z, `i16` little-endian raw counts, range **±500 dps**, **17.5 mdps/LSB** |
| `6..12` | SFLP quaternion x/y/z, **IEEE half-precision fp16**; `w = √(1 - x² - y² - z²)` |

**Note that `w` is not transmitted** - it is recovered on the host from the unit-quaternion constraint, saving 2 bytes.

**SFLP** is the **hardware sensor-fusion block** inside the LSM6DSV16X; it outputs the game rotation quaternion directly
- the host does not need to run its own attitude fusion.

### 16 devices on the bus in total

```
ID  10 11 12 13 14   right leg
ID  20 21 22 23 24   left leg
ID  30 31 32 33 34   neck / head / mouth
ID  200              imu_to_dxl board
```

15 servos + 1 IMU board = **16 devices, all read back in one `sync_read`**.

### Things to watch when replicating

- **The protocol and register layout have been fully reconstructed**; just implement them as documented ([Hardware Teardown](hardware-teardown.md))
- **Use a 2.5 mm pitch 3P connector** (JST EH / 5264)
- **Input capacitor rated >= 25 V** - the bus sits at 8.4 V fully charged, a 10 V rating has no margin (and MLCCs lose capacitance under DC bias)
- **Add a pull-up on the CS pin** - see the real-world case in the next section
- **Put a TVS on the DATA line** - hot-plugging servos is routine

---

## 5. (4) IMX219 camera

MIPI CSI interface, 8 megapixels. The device tree overlay used is `radxa-zero3-rpi-camera-v2`,
with the ISP configured as `SENSOR = imx219`.

**Two traps:**

1. **It is rotated 90°, not flipped 180°.** The code says
   `/// 90, because the head camera is mounted a quarter turn off, and this is the one place
   that fact is written down.` Some early material says 180; that is **alpha-unit** data.
2. **Buy the shortest ribbon cable.** The camera and the main board **share one rigid body, about 13 mm apart, with no joint between them** -
   the MIPI cable does not cross the neck. 4-15 cm is plenty; do not buy 30 cm.

> ⚠️ The official Radxa documentation only says "1x4-lane MIPI CSI", **with no pin count or pitch**.
> But the board is Pi Zero form factor with the CSI socket on the same edge as the Micro HDMI, so it is **very likely the narrow 22-pin 0.5 mm connector**,
> whereas generic IMX219 modules ship with the standard 15-pin cable - keep an adapter cable on hand (a few yuan).

---

## 6. (5) ToF module

**Not a lidar.** It is an ST FlightSense multi-zone ranging chip that outputs an **8x8 distance matrix**.

| Item | Value |
|---|---|
| Part | **VL53L5CX or VL53L8CX**, auto-detected by the firmware from the revision ID (`0x02` = L5cx, `0x0C` = L8cx) |
| Interface | I²C, on **i2c3 @ 400 kHz** |
| Address | **`0x29` or `0x52`** (both candidates are tried) |
| Physical connection | **JST SH 1.0 mm 4P** on the HAT (Qwiic / Stemma QT) |
| Frame rate | 15 Hz |

> ⚠️ **Do not buy a VL53L0X by mistake** - that is a **single-point** ranger and the firmware will not recognise it.
> **The VL53L7CX is not the L8CX either** (the L7 is the other part, with a 90° field of view).

---

## 7. What happens in one tick

The policy runs at 50 Hz, i.e. **one cycle every 20 ms**:

```
   (1) one sync_read                 ttyS2 @ 1 Mbps
      ├─ ID 200   → gyro + quaternion    ┐
      ├─ ID 10-14 → right leg, 5 angles  ├ 12 bytes x 16 devices
      ├─ ID 20-24 → left leg, 5 angles   │  timestamps naturally aligned
      └─ ID 30-34 → neck/head/mouth, 5   ┘

   (2) assemble the 61-dimensional observation vector

   (3) ONNX policy inference (a small 775 KiB network) → 14-dimensional action

   (4) voltage adaptation: scale x (7.4 / EMA of measured battery voltage)
      - as the battery drops from 8.4 V to 6.5 V the same PWM gives very different torque;
        without compensation the policy drifts

   (5) one sync_write, sending the 14 target positions down
```

Running alongside: the ToF (15 Hz) and the audio codec on **i2c3**, and the camera on **MIPI CSI**.

> ⚠️ **The 20 ms budget is tight, and it is not just a Feetech problem.**
> The official source says: the XL330 ships with `return_delay_time = 250`, i.e. **a 500 µs turnaround delay per device**,
> "Across 16 devices that is **8 ms per tick - 40% of a 20 ms budget**".
> The official fix is to **write 0** to that register.
> Whatever servo you swap in, this step has to be redone and measured.

---

## 8. Going the Feetech route: what changes

Many people (this repository included) are evaluating Feetech servos as a replacement for the XL330. Impact, ordered by severity:

| Impact | Notes |
|---|---|
| 🔴 **The 9 official ONNX policies will most likely stop working** | Different servo means different torque curve, mass, and possibly gear ratio. **Must be retrained** (needs a CUDA GPU or HF jobs) |
| 🟡 **Bus timing must be measured** | Feetech uses its own STS/SCS instruction set (including `0x82 SYNC READ`) with a different packet format. **But do not assume it is necessarily slower** - the official Dynamixel path has the same per-device turnaround delay (see above). First thing to do when the parts arrive is a benchmark, with an **FE-URT-1 debug board** |
| 🟡 **`imu_to_dxl` has to be repositioned** | The bus protocol changes, so this board either becomes a Feetech slave emulator or abandons the "on the bus" design and connects the IMU directly over SPI. **Recommendation: same hardware, dual-protocol firmware** - the physical layers are identical (half-duplex single-wire TTL / 1 Mbps / 3 wires); the differences are the **packet format** and the **factory defaults**, see "Feetech STS/SCS protocol comparison" in the [Hardware Teardown](hardware-teardown.md) |
| 🟢 **The voltage actually fits better** | The Feetech HD-1910 is natively 5-8.4 V; no need to run it over-voltage the way the XL330 is |

---

## 9. How to check it yourself: five things to do before you replicate

**This section matters more than everything above it.**

Open-source project material goes stale and contains mistakes; AI-generated schematics even more so. Below are the checks this repository
has distilled from practice - every one of them corresponds to a real failure.

### 1. Pinout: open the datasheet pin table and compare pin by pin

**Real case:** this repository received a schematic PR for `imu_to_dxl`. The drawing was complete, but the
LSM6DSV16X pins were wired wrong - checking against **ST DS13510 Rev 1 Table 1** (page 10) showed:

| Pin | Datasheet | Drawn in the PR |
|---|---|---|
| **12** | **CS** (chip select) | ❌ shifted |
| **13** | **SCL** (SPI clock) | ❌ shifted |
| **14** | **SDA** (SPI data) | ❌ shifted |
| **2 / 3** | **SDx / SCx auxiliary interface**, datasheet requires **tie to GND** when unused | ❌ used as the main interface |

That board, once built, **would not work**. And finding the problem took exactly one thing: **open the datasheet, go to the pin table, compare line by line**.

> **A schematic drawn without the datasheet is a schematic not drawn.** No exceptions.

### 2. Voltage margin: every capacitor's rating vs the real bus voltage

In the same PR the input capacitor was rated **10 V**, while the bus sits at **8.4 V** fully charged. It looks like there is margin, but:
- MLCCs have a **DC bias effect**: 8.4 V across a 10 V-rated MLCC can cut the real capacitance by more than half
- The battery and motor back-EMF produce spikes

**Rule: the rating is at least 2x the working voltage.** For an 8.4 V bus, use 25 V.

### 3. Power-up state: what level the mode-select pin sits at during power-up

The level on the LSM6DSV16X CS pin **decides between SPI and I²C at power-up**. If CS floats,
the power-up instant is undefined - it works sometimes and not others, the hardest kind of bug to find.

**Add a 10 kΩ pull-up to 3V3** to lock in SPI mode.

### 4. Run ERC, and run it to 0 errors 0 warnings

The KiCad command line does it:

```bash
kicad-cli sch erc --output erc.rpt your.kicad_sch
```

Common real problems: a power pin with no driver (missing `PWR_FLAG`), two Power output pins fighting each other,
pin coordinates off the connection grid (looks connected, is not).

### 5. Cross-check: addresses and registers in the software source vs the hardware

The upstream software is open source, and **the code is the datasheet**. Every address in the hardware can be matched in the code:

| Hardware | Evidence in the software |
|---|---|
| Audio codec `0x18` | `deploy/audio/i2c3-pihat.dts` |
| ToF `0x29` / `0x52` | `ADDRESS_CANDIDATES` in `tof/src/main.rs` |
| IMU board ID 200 | `IMU_DXL_ID` in `duck-control/src/model.rs` |
| Servo ID assignment | Same file, `JOINT_IDS` |
| i2c3 400 kHz | `clock-frequency` in `i2c3-pihat.dts` |
| BMI088 unused | `i2c3-pihat.dts` comments: `dormant`, `unused but still connected` |

**If they disagree, one side is wrong.**

---

## Appendix: sources for every conclusion in this document

| Conclusion | Source |
|---|---|
| Where the boards are mounted | `robot_walk.xml:235` (HAT), `:247` (main board), both in the `jaw_soft` body |
| 40-pin allocation | GPIO table in `ASE01187-C1_elec_RPI_Robot_HAT_SCH.pdf` |
| HAT board specs | Measured from Gerber `Edge_Cuts.gm1`; BOM.csv 47 lines / POS.csv 117 lines |
| Servos on `+BATT` | Dynamixel page of the schematic (4/6), annotated "3A max" |
| Only one buck | The entire BOM.csv has only one inductor, L4 (FB1/2/3 are ferrite beads) |
| 12-byte register layout | `robotd` source, see [Hardware Teardown](hardware-teardown.md) |
| Camera rotated 90° | `mediad/src/main.rs:82` |
| 8 ms turnaround delay | `duck-control/src/model.rs:84-86` |
| LSM6DSV16X pinout | **ST DS13510 Rev 1, Table 1, page 10** |

> This document is derived from the official public MJCF model, STL meshes, open-source hardware project and runtime source,
> and is **not verified against physical hardware**. If you find an error, please open an issue.
