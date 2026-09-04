# Electronics Sourcing List (China / Taobao)

> **Snapshot date: 2026-09-04.** Prices and sales counts change and links may die; check prices yourself before ordering.
> Mechanical parts (bearings / fasteners / filament) are in the [Mechanical Sourcing List](mechanical-sourcing-list.md).
>
> This list is not an endorsement, just a record of search results. Store details (sales counts, store age) are the values displayed at capture time.

---

## First, get this straight: where the boards are mounted

This directly determines what cable specs you buy, and **it is very easy to get wrong**:

```
Head (the jaw_soft body in the MJCF)
 ├── Raspberry Pi form-factor main board   ← the main board is in the head, not the trunk
 ├── RPI Robot HAT                          ← stacked 7.3 mm above the main board
 ├── IMX219 camera + M12 lens               ← about 13 mm from the main board centre, same rigid body, no joint between
 └── Speaker

Trunk (trunk_base)
 ├── two hip_yaw XL330s                     ← they fill most of the cavity
 ├── trunk_base bottom plate
 └── NP-F battery - hangs outside, low on the back; about 40 mm of its 71 mm length sits outside the shell,
      clamped from outside by two power_support parts

What passes through the 3-DoF neck: the servo bus + the +BATT feed coming up from the battery
```

**Evidence**: `robot_walk.xml:235` `mesh="elec_rpi_robot_hat_pcb"`, `:247` `mesh="pcb__raspberry_pi_zero_2_w"`;
both geoms are inside the `jaw_soft` body; the two 65x30 boards are perfectly aligned in X/Y with a 7.3 mm Z gap, the standard Pi + HAT stack.

> ⚠️ **So the MIPI ribbon does not cross the neck; the shortest one is enough.** The real harness-fatigue risk is **the servo bus and the power lead crossing the neck**
> - those carry current and deserve more attention than a signal ribbon. And the official project **has published no wiring information at all**.

---

## 1. Main board · Radxa Zero 3W

### Which configuration to buy

**Conclusion: 2G / 16G eMMC.** The reasoning:

**Storage side**

| Item | Size | Basis |
|---|---|---|
| Armbian headless rootfs | ~2 GB | `deploy/README.md:144` confirms a headless image; **2 GB is an external rule of thumb, no basis in the repository** |
| **ONNX Runtime** | **~20 MB** | `docs/design/robotd-design.md:420` verbatim: "ONNX Runtime is a board prerequisite ... **~20 MB** in every artifact would enlarge every update for nothing" - **preinstalled at board level, not in the release package** |
| **GStreamer stack** (used by `mediad`) | **~100 MB** | `docs/design/updater-design.md:901` "the GStreamer stack for `mediad`, which is **around 100 MB of apt**" |
| RKNN runtime `.so` | Unknown | No basis in the repository; not making up a number |
| Daemon artifacts + one retained previous version | Order of 10¹ MB | `Cargo.toml:79` "**model artifacts will dwarf a few MB of binary**"; `keep_previous = 1` |
| **9 locomotion policy ONNX files** - each **793,685 B ≈ 775 KiB** | **7 MB** | Measured. `alpha_stand` / `alpha_walking` / `alpha_sitstand` / `alpha_ground_pick` / `ball_kick_left` / `ball_kick_right` / `roller` / `roller_crouch` / `roulade` |
| `duck_detect.onnx` | 10.0 MB | Measured 10,477,940 B |
| `pet_detect.onnx` | 19 KB | Measured 20,201 B |
| journald cap `SystemMaxUse=200M` | **Uses no disk in the default configuration** | `/var/log` is a zram device (`deploy/README.md:14/402/437`). But README:454 gives an escape hatch: turn off `armbian-zram-config` and logs land on the eMMC |
| **Total** | **≈ 3-4 GB** | |

→ **8 GB eMMC is enough, 16 GB is comfortable, 64 GB is pointless.**

> 💡 **The update mechanism does not need a duplicate rootfs.** But **do not call it A/B** - upstream `docs/design/updater-design.md:46`
> clarifies this explicitly: "Update granularity | **Application-level (not A/B image)** | Only daemon + model
> change; OS is static. A/B (RAUC/Mender) would be over-engineering."
> It is actually **versioned directories + atomic `current` symlink switch (`rename(2)`) + health gate + rollback**,
> and `keep_previous = 1` only keeps one extra old daemon. (The real `tag_prefix` value in `updater.toml` is `daemon-v`.)

**Memory side**

| Item | Usage |
|---|---|
| Armbian headless | ~250 MB (external rule of thumb) |
| robotd + ONNX Runtime + RKNN | Small - the policy models are only 775 KiB each |
| Camera / GStreamer buffers + `duck_detect` | ⚠️ **`duck_detect.onnx` runs on the CPU, not the NPU** (`robotd.toml:324` "a `.rknn` runs on the NPU, an `.onnx` on the CPU"; the NPU `.rknn` build is not in the repository). And **the RK3566 NPU shares DDR with the CPU; there is no dedicated memory** |
| ⚠️ The zram device behind `/var/log` - **eats RAM, not disk** | Must be reserved |

→ **1 GB runs but is tight, 2 GB is comfortable, 8 GB is pure waste.**

> ⚠️ **The official spec is 1 GB / 32 GB, but that does not mean a replica should buy that tier.**
> The official 2026-08-27 release page lists **1 GB / 32 GB eMMC** (which is exactly one Radxa Zero 3W SKU,
> and in turn corroborates the main-board identification); but nothing in the `microduck/` source names a board SKU - the source never would.
> **From the sizing above, the replica recommendation is 2G/16G**: 1 GB has to share memory with the zram log device and runs tight.

### Channels - domestic e-commerce prices are inflated across the board

Real prices from the official distributor [ALLNET China](https://shop.allnetchina.cn/products/copy-of-radxa-zero-3w) (USD, about ¥7.2/$):

| Configuration | Price | Approx. |
|---|---|---|
| 1G / no eMMC | $18 | ¥130 |
| 1G / 8G eMMC | $22 | ¥158 |
| **2G / 16G eMMC** | **$32.90** | **¥237** ⭐ |
| 4G / 32G eMMC | $50 | ¥360 |
| 8G / 32G eMMC | $70 | ¥504 |

(With header +$1. ALLNET does not carry the 8G/64G spec.)

Domestic listings:

| Store | Configuration | Price | Link |
|---|---|---|---|
| findboard flagship store | 8G+64G "bundle 6" (with camera / power supply / 32G card / HDMI cable / heatsink) | **¥1469** | [tmall 752703346347](https://detail.tmall.com/item.htm?id=752703346347) |
| findboard flagship store | 8G+64G bare board | ¥1149 | Same as above |
| Lukong Automation (industrial control) | Not stated (negotiable) | ¥690 | [taobao 1044607515575](https://item.taobao.com/item.htm?id=1044607515575) |

**A 3-6x markup.** Go through ALLNET China, AliExpress or Radxa's official channels instead; domestically you can also ask
[mcuzone (Hangzhou Yexin Tech store)](https://item.taobao.com/item.htm?id=1055301489376) (they make a full set of Zero 3W expansion boards and very likely have bare-board stock).

### Skip the bundles

| Accessory | Worth it? |
|---|---|
| Camera (Radxa's own IMX219, ¥129.99 sold separately) | ❌ A generic IMX219 is ¥32.8 |
| 32G microSD | ❌ Unused once you have eMMC |
| Power adapter | ❌ The robot is battery powered; only for bench debugging |
| microHDMI cable | ❌ The robot runs headless |
| Heatsink | ✅ Useful, but buy it separately at [¥19.99](https://item.taobao.com/item.htm?id=788387010174) |

---

## 2. Main board alternative · LCSC Taishan Pi (evaluated, **does not fit**)

Same **RK3566**, stable domestic supply, and people keep asking about it. **But the conclusion is that it cannot be used.**

**Real prices** (the true price after selecting the "2G+16G board only" SKU; the ¥22 / ¥45 / ¥195 on the listing pages are all lowest-SKU bait):

| Channel | Configuration | Real price | Link |
|---|---|---|---|
| RK Dev Boards (9-year store) | 2G+16G board only | **¥428** (+¥10 shipping) | [taobao 1017038620459](https://item.taobao.com/item.htm?id=1017038620459) |
| Electronic Components shop (12-year store, 46 paid orders) | 2G+16G board only | **¥480.8** (free shipping) | [taobao 800894187326](https://item.taobao.com/item.htm?id=800894187326) |
| LCSC official mall | 2G+16G | **¥580** (was ¥228, raised with DDR prices) | [item.szlcsc.com/20558171](https://item.szlcsc.com/20558171.html) |
| **For comparison: Radxa Zero 3W** | 2G/16G | **≈¥237** | ALLNET China |

**Four strikes against it:**

| | Taishan Pi | Radxa Zero 3W |
|---|---|---|
| **Does it fit?** | ❌ **It does not** - the main board is mounted **in the head**, and the whole head shell is only 58.8 x 91.8 x 122.7 mm,<br>the main-board slot is only 30 mm in X, with a HAT stacked on top. The Taishan Pi at **70 x 45** has nowhere to go | ✅ 65 x 30, the slot was designed around it |
| 2G+16G real price | ¥428-580 | **≈¥237** |
| **Armbian image** | ❌ The whole official deployment script set is built on Radxa's Armbian image<br>(`overlay_prefix=rk35xx`, `armbian-zram-config`, netplan, the updater); would have to be rewritten | ✅ Use as-is |
| **Device tree overlays** | ❌ All must be rewritten - 40-pin muxing is a **board-level mapping**.<br>The design depends on `/dev/ttyS2`, `i2c3 @400kHz`, `i2s3_2ch`, MIPI CSI | ✅ Ready made |
| **HAT mechanical compatibility** | ❌ 70x45 vs Pi Zero 65x30, header positions do not line up, **the HAT would have to be redrawn** | ✅ Same Pi Zero form factor |
| SoC / NPU / rknn | ✅ Same RK3566, kernel and NPU work is reusable | ✅ |
| WiFi | AP6212 (WiFi4 / BT4.x) | WiFi6 / BT5.4 |

**Its open-source material is still worth keeping** (downloadable without buying the board): the complete schematic + PCB is in **EasyEDA (JLC) format**;
the power tree, DDR routing and AP6212 hookup for the very same RK3566 can be opened and read directly - a ready-made high-quality reference when drawing `imu_to_dxl`
or redrawing the HAT later.

- [OSHWHub (LCSC open-source hardware platform) · Taishan Pi project](https://oshwhub.com/li-chuang-kai-fa-ban/li-chuang-tai-shan-pai-kai-fa-ban)
- [Download centre](https://openkits-wiki.easyeda.com/zh-hans/tspi-rk3566/download-center.html)

---

## 3. Camera · IMX219 (MIPI CSI)

The camera and the main board are **both in the head, in the same rigid body**; `setup-board.sh:748` uses the overlay
`radxa-zero3-rpi-camera-v2`, and `setup-rkaiq.sh:147` sets `SENSOR = imx219`.

> ⚠️ **It is rotated 90°, not flipped 180°.** `mediad/src/main.rs:82`:
> "**90, because the head camera is mounted a quarter turn off**, and this is the one place
> that fact is written down." The 180° in `docs/project/media-bringup.md:472` is outdated **alpha-unit** data.

| Store | Price | Sales | Link |
|---|---|---|---|
| DECXIN flagship store | ¥32.8 | 100+ | [tmall 775872575316](https://detail.tmall.com/item.htm?id=775872575316) |
| Dechuangxin Cameras | ¥32.8 | 27 | [taobao 771618094322](https://item.taobao.com/item.htm?id=771618094322) |
| Shengchengwei Tech (11-year store) | ¥38 | 84 | [taobao 596521821696](https://item.taobao.com/item.htm?id=596521821696) |
| Yahboom (14-year store, has technical docs) | ¥44 | 15 | [taobao 709927597121](https://item.taobao.com/item.htm?id=709927597121) |
| Raspberry Pi Retailer (free shipping, ships in 48 h) | ¥68 | 100+ | [taobao 760446989892](https://item.taobao.com/item.htm?id=760446989892) |
| findboard flagship store (official Radxa version) | ¥129.99 | 9 | [tmall 874789708454](https://detail.tmall.com/item.htm?id=874789708454) |

### Ribbon cable: 15-pin ⇄ 22-pin adapter (possibly needed, **buy the shortest**)

⚠️ **The official manual does not give the connector spec.** The `Radxa ZERO 3W Product Brief` Rev 1.10 §6.3 says only:

> "The Radxa ZERO 3W is equipped with a **1x4-lane MIPI CSI** connector for camera integration.
> This interface is designed to be backward-compatible with standard industrial camera peripherals."

No pin count, no pitch. But the Zero 3W is Raspberry Pi Zero form factor, with the CSI socket on the same edge as the Micro HDMI and the same layout as the Pi Zero,
so it is **very likely the narrow 22-pin 0.5 mm connector**, whereas generic IMX219 modules ship with the **standard 15-pin 1.0 mm** cable.

> 💡 **15 cm or even shorter is enough** - the camera and the main board share one rigid body, about 13 mm apart,
> and the ribbon **does not cross the neck**. Do not buy 30 cm.

| Store | Notes | Length | Price | Link |
|---|---|---|---|---|
| **Huibo Shijie Tech factory store** | 15-to-22-pin gold-finger FPC, **4 cm short version** | 4cm | **¥1.88** | [taobao 654755002992](https://item.taobao.com/item.htm?id=654755002992) |
| Camera Manufacturer store (11-year store) | Pi Zero Camera Cable | 16cm | ¥1.88 | [taobao 819560127110](https://item.taobao.com/item.htm?id=819560127110) |
| **Tytion (15-year store)** | Title explicitly says **15P 1.0 to 22P 0.5** | 15cm | ¥2.5 | [taobao 678057486394](https://item.taobao.com/item.htm?id=678057486394) |
| Raspberry Pi Boutique Seller (13-year store, free shipping) | Official cable, 135/200/300/500 mm options | Various | ¥5.8 | [taobao 784739658496](https://item.taobao.com/item.htm?id=784739658496) |

---

## 4. ToF ranging · VL53L8CX (8x8 multi-zone)

The firmware supports both **VL53L5CX and VL53L8CX**, auto-detected from the revision ID
(`tof/src/sensor.rs:70-100`: `0x0C = L8cx` / `0x02 = L5cx`).
I²C address candidates **`0x29` or `0x52`** (`tof/src/main.rs:87`), on i2c3 @ 400 kHz.
On the HAT it uses the **JST SH 1.0 mm 4P** (Qwiic / Stemma QT) connectors J5-J8.

| Store | Part | Price | Sales | Link |
|---|---|---|---|---|
| Senkeyuan Electronics | VL53L8CX | ¥70 | 1 | [taobao 1025775539663](https://item.taobao.com/item.htm?id=1025775539663) |
| Shenzhen Hongwen Electronics | VL53L8CX | ¥74.98 | 0 | [taobao 977907234039](https://item.taobao.com/item.htm?id=977907234039) |
| Duhui Mingwu Electronics (free shipping, 20k repeat customers) | VL53L7CX / **L8CX** | ¥75 | 100+ | [taobao 942554129061](https://item.taobao.com/item.htm?id=942554129061) |
| Shenzhen Youxin Electronics (technical docs, free shipping, invoices for companies) | VL53L8CX | ¥78.5 | 31 | [taobao 967946231167](https://item.taobao.com/item.htm?id=967946231167) |
| Yongtaifa Electronics (11-year store, free shipping) | VL53L8CX | ¥84.8 | 14 | [taobao 939165242465](https://item.taobao.com/item.htm?id=939165242465) |
| Guijixing flagship store | Official ST P-NUCLEO-53L8A1 evaluation kit | ¥98 | 1 | [tmall 725486284128](https://detail.tmall.com/item.htm?id=725486284128) |

> ⚠️ **Do not buy a VL53L0X by mistake.** The vast majority of hits for "VL53L5CX" are **VL53L0X - single-point ranging**, which the firmware will not recognise.
> Also note **VL53L7CX ≠ VL53L8CX** (the L7 is the other part, with a 90° field of view); some listings mix L7/L8 in one item, so read the SKU carefully.
> Seen: a ¥8 "VL53L5CX" whose title also said "79GHz radar sensor" - keyword-stuffed junk.

---

## 5. Power

| Item | Store | Price | Sales | Link |
|---|---|---|---|---|
| **NP-F battery holder (for power pickup)** | Tenghu flagship store | ¥17.8 | 99 | [tmall 658975825526](https://detail.tmall.com/item.htm?id=658975825526) |
| **NP-F power pickup plate** (Type-C fast charge) | Topsai flagship store | ¥19 | 58 | [tmall 926961598924](https://detail.tmall.com/item.htm?id=926961598924) |
| NP-F550 battery itself | Viltrox (Chinese 3C certified, with charge indicator) | ¥52.8 first order | 900+ | Search "Viltrox NP-F550" |

> 💡 **These two fill exactly the gap upstream left.** Officially there is only the printed part `power_support` (x2),
> **no contact model**; the power-pickup solution was originally left to you - just buy a ready-made pickup plate.
>
> ⚠️ **It is an NP-F550, not an F970.** The upstream mesh name `np_f970` is misleading: the measured bounding box
> **38.6 x 20.6 x 70.8 mm** is the F550 size (Sony official specs: F550 = 38.4x20.6x70.8,
> F970 = 38.4x**60.0**x70.8). A grep of the whole source tree gives only 2 hits, **both NP-F550**
> (`robotd-design.md:572`, `duck-control/src/model.rs:108` "NP-F550, 2S Li-ion"); F970 gets zero hits.
>
> The battery **hangs outside, low on the back of the body**; about 40 mm of its 71 mm length sits below the lower edge of the trunk shell, clamped from outside by two
> 83.5 mm long `power_support` parts.

---

## 6. The two PCBs

### RPI Robot HAT - not for sale, fab only; but you may not need it

**Not sold separately.** Upstream only sells the complete robot; the HAT has no retail page. No replica turned up on oshwhub either.

**(1) Faithful fab run** - the official project ships complete production files (Gerbers + BOM + pick-and-place, Apache-2.0).
Verified by measurement: **4-layer board** (`F_Cu / In1_Cu / In2_Cu / B_Cu`), outline **65.0 x 30.9 mm**, corner radius **R3.5**,
BOM **47 lines / 123 parts** (5 lines / 9 parts DNP), **113 placements** actually fitted. With SMT, cost starts at a few hundred yuan and there is a minimum order quantity.

**(2) Replace it with off-the-shelf modules - under ¥50**

What the HAT actually does (checked line by line against the schematic):

| Function | Still needed? | Off-the-shelf replacement |
|---|---|---|
| **Servo bus half-duplex TTL** - U5 `74LVC1G08` + U6 `SN74LVC1G125` + U7 `SN74LVC1G126`,<br>direction controlled by `DynUART_Tx`/`DynUART_Rx`/`Dynamixel_dir` | ✅ Mandatory | See table below |
| **Power distribution** - `+BATT` straight to the servos; U9 `AP63205` + L4 6.8 µH → `+5V` up the 40-pin to the main board;<br>U3 `XC6206P182` → `+1V8` for the codec | ✅ Mandatory | An off-the-shelf UBEC (5 V / 3 A or more) |
| **Audio** - U2 `TLV320AIC3104` (i2c3 0x18 + i2s3_2ch), U1 `PAM8406D` amplifier,<br>MK1 MEMS microphone, Wago terminals for the 5 W speaker and an external mic | ❓ Depends on your needs | **Drop the whole block if you do not need recording or the speaker** |
| **Sensor expansion** - J5-J8 JST SH 1 mm 4P (Qwiic/Stemma) for the ToF | ✅ Needed | Hang it straight on i2c3, a few wires |
| On-board U11 `BMI088` | ❌ **Fitted but unused by software** (`i2c3-pihat.dts:11` "dormant", `:31` "unused but still connected") | - |
| U4 `CAT24C32` EEPROM | ❌ **DNP, not fitted** - so this board **is not a self-identifying HAT** | - |

**Servo connectors**: J13 / J14 = **JST EH 3P** (TTL, through the TH1 100R thermistor to `+BATT`);
J3 / J11 = **JST EH 4P** (RS-485, driven by U8 `SIT3088E`, straight to `+BATT`), annotated **"3A max"** in the schematic.

**Half-duplex bus adapter boards** (a direct match if you go the Feetech route):

| Store | Notes | Price | Link |
|---|---|---|---|
| Fashion Bozi (13-year store, 90 paid orders) | Serial bus servo driver board, **for the ST/SC series** | **¥22** | [taobao 1005305041207](https://item.taobao.com/item.htm?id=1005305041207) |
| Zhongling Tech enterprise store (200+ paid orders) | ZLink USB/TTL debug board + bus servo adapter | ¥22.5 | [taobao 570100064201](https://item.taobao.com/item.htm?id=570100064201) |
| Xinbanfang (7-year store) | Waveshare serial bus servo driver board, for ST/SC | ¥24 | [taobao 954634564409](https://item.taobao.com/item.htm?id=954634564409) |
| Lingying Intelligent enterprise store (200+ paid orders) | ST/SC Feetech bus servo TTL driver board `TTL_Adapter_(A)` | ¥26 | [taobao 983866781632](https://item.taobao.com/item.htm?id=983866781632) |

> 💡 **If you go the Feetech route, this option deserves serious consideration.** `imu_to_dxl` has to be redrawn, the policies retrained, the device tree changed -
> the HAT deserves re-evaluation just the same. A ¥22 adapter board + one UBEC covers the two mandatory functions, "servo bus" and "power distribution".
> The cost is losing on-board audio.

### imu_to_dxl - draw it yourself

STM32G031F8P6 + LSM6DSV16X + half-duplex buffer, presented to the bus as a slave (ID 200 on the Dynamixel side).
The protocol and register layout have been fully reconstructed, see [Hardware Teardown](hardware-teardown.md).

- **Fab cost**: 2-layer board, about ¥25-40 at JLCPCB (without assembly)
- **Dual protocol**: to support both Feetech and Dynamixel, **keep the hardware, branch the firmware** -
  the physical layers are identical (half-duplex single-wire TTL / 1 Mbps / 3 wires); the only difference is the packet format
  (V2 header `FF FF FD 00` + CRC-16; Feetech `FF FF` + `~sum`)
- **Use a 2.5 mm pitch 3P connector** - Feetech cables are specified as **5264 terminals**, the official HAT uses **JST EH 2.5 mm**,
  **same pitch**. The PR #12 version of the drawing had JST PH 2.0 mm, **which must be changed**
- **C1 rating 10 V → 25 V** - the bus sits at 8.4 V fully charged, 10 V has no margin (and MLCCs lose capacitance under DC bias)
- **Put a TVS on the DATA line** - hot-plugging servos is routine

---

## 7. Cables and tools

| Item | Store | Notes | Price | Link |
|---|---|---|---|---|
| **Servo bus cable** | Shenzhen Feetech Servo factory store | 3-pin / 4-pin **5264 connector** | **¥1.8** | [taobao 616460581906](https://item.taobao.com/item.htm?id=616460581906) |
| Servo cable | Hongyi Electronics servo factory store | Feetech serial bus, 3-pin / 4-pin 5264 terminals | ¥2.5 | [taobao 769633088382](https://item.taobao.com/item.htm?id=769633088382) |
| Servo cable (multiple lengths) | Songjia Tech (300+ paid orders) | Female-to-female **5264-3P**, 10/15/20/30/50/70 cm | ¥2 | [taobao 587191439333](https://item.taobao.com/item.htm?id=587191439333) |
| **FE-URT-1 debug board** | Shenzhen Feetech Servo factory store (official store) | USB to 485/TTL | **¥45** | [taobao 603181554943](https://item.taobao.com/item.htm?id=603181554943) |
| URT-2 debug board | Shenzhen Feetech Servo manufacturer store | Same class | ¥45 | [taobao 575365901461](https://item.taobao.com/item.htm?id=575365901461) |
| URT debug board (third party) | Yunquzhe Tech enterprise store | Same class | ¥40 | [taobao 712781832610](https://item.taobao.com/item.htm?id=712781832610) |

> **The debug board is mandatory** - the first thing to do when the servos arrive is to measure the bus timing.
>
> ⚠️ **This is not a Feetech-only problem.** The official Dynamixel path also has **one reply delay per device** -
> `duck-control/src/model.rs:84-86` says the XL330 ships with `return_delay_time = 250`,
> i.e. **500 µs/device**, "Across **16 devices** that is **8 ms per tick - 40% of a 20 ms budget**",
> and the official fix is to write 0 to that register (in `EXPECTED_REGISTERS`).
> **The Feetech side has been checked**: STS/SCS has `SYNC READ` (`0x82`), and its Return Delay Time is 0 from the factory -
> see [Hardware Teardown · Feetech STS/SCS protocol comparison](hardware-teardown.md). All the more reason to measure rather than assume it is slower.

---

## 8. Pitfalls

1. **Do not buy a long camera ribbon** - the main board and camera are both in the head, in one rigid body; the MIPI cable does not cross the neck. 4-15 cm is plenty.
2. **The camera is rotated 90°, not 180°** - see above.
3. **VL53L0X passed off as VL53L5CX** - most hits are the single-point L0X, which the firmware will not recognise; and the L7CX is not the L8CX.
4. **Radxa bare-board markup** - official distributor $22-70 (¥158-504), Taobao listings ¥690-1469. Change channel.
5. **The Taishan Pi does not fit** - it is not just expensive; there simply is no 70x45 space in the head.
6. **The ¥8 Feetech STS3215 / the ¥22 Taishan Pi** - both are SKU bait; the lowest tier inside is an accessory.
7. **Loctite 243 under ¥15 is suspect as counterfeit** (see the [Mechanical Sourcing List](mechanical-sourcing-list.md)).

---

## Unverified items

- All prices, sales counts, store details and link validity (2026-09-04 snapshot)
- Whether upstream sells the HAT separately
- Whether the Zero 3W CSI socket is really 15P or 22P (not in the official docs; marked "very likely 22P" here)
- The Taishan Pi's specs, prices and open-source project contents
