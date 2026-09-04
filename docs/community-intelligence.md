# Community Intelligence

> Signals about the **upstream** robot, its vendor and its community, collected as evidence for this
> project. Names, handles and quotes are reproduced as published.

**Recorded**: 2026-08-31
**Sources**: X (public posts read through a logged-in session), the GitHub API, public press coverage

> ⚠️ This document separates **verifiable facts** from **unconfirmed rumour**. Anything marked
> 🔴 is second-hand information; do not base decisions on it.

---

## 1. Timeline

| Date | Event |
|---|---|
| 2026-08-27 | Pollen Robotics × Hugging Face launch Microduck; pre-orders open at $399 |
| 2026-08-27 | The software stack (Rust runtime + RL training) is released under Apache-2.0 |
| 2026-08-30 | The community starts asking on GitHub for STEP files, 3D-print source files and the power-board schematic |
| 2026-08-31 | Thomas Wolf: *"Microduck reached the Shopify UI limit"* |
| **Before Christmas 2026** | **First shipments (North America / Europe / UK)** |

> 📌 **Key premise: as of 2026-08-31 there is no physical unit in anyone's hands.**
> Every public "teardown" so far is therefore **inference from software and specifications**,
> not a physical disassembly.

---

## 2. Traction figures (verifiable)

### Official launch posts

| Account | Likes | Views |
|---|---|---|
| [@ClementDelangue](https://x.com/ClementDelangue/status/2092931447644442635) (HF CEO) | 11,974 | 4.49 M |
| [@Thom_Wolf](https://x.com/Thom_Wolf/status/2092923071829049592) (HF co-founder) | 7,833 | 2.56 M |
| [@pollenrobotics](https://x.com/pollenrobotics/status/2092915032052879425) | 4,761 | 1.56 M |

### GitHub repository growth

| Repository | 2026-08-28 | 2026-08-31 |
|---|---|---|
| `pollen-robotics/microduck` | 938 ★ / 87 forks | **3,508 ★ / 418 forks** |
| `pollen-robotics/microduck_rl` | 280 ★ / 33 forks | **876 ★ / 152 forks** |

About 3.7× in three days.

### Sales

- 🔴 "Passed $1 million in sales within 7 hours" - from [@DataChaz](https://x.com/DataChaz/status/2094028777634533518) (826 likes),
  **an unofficial figure, not confirmed by the vendor**
- ✅ Thomas Wolf himself posted on 8/31 that *"Microduck reached the Shopify UI limit"* - indirect confirmation that volume is high
- 🔴 A Chinese-language account claimed "$2.6 million in 24 hours, one unit every 4 seconds on average"; **the same account was promoting a meme coin at the time, so its credibility is low**

---

## 3. ⭐ External validation: someone else independently reached the same main-board conclusion

On 2026-08-31, [@tspy](https://x.com/tspy/status/2094249218735300630) published a "Microduck physical architecture teardown" (169 likes):

> Actuators 15 × Dynamixel XL330 · main board **Radxa ZERO 3W / Rockchip RK3566** ·
> 1 GB RAM + 32 GB · dual 6-axis IMU · 8×8 multi-zone ToF LiDAR · forward wide-angle camera ·
> 2× NFC antennas · NP-F550 battery · 50 Hz control rate

**This matches the conclusions of this repository's [Hardware Teardown](hardware-teardown.md) exactly**, including the
single most important call: the **Radxa Zero 3W**. Two independent paths arrived at the same answer.

In the same thread, @tspy's answer to the cost question also agrees with this repository's conclusion:
> **"The cost appears to be higher than simply buying one"**

### How much deeper Macrodork goes than the public community analyses

| Layer | Public community analysis | Macrodork |
|---|---|---|
| Spec list | ✅ | ✅ |
| Main-board model | ✅ | ✅ |
| **Bus electrical layer and protocol** | ❌ | ✅ TTL half-duplex 1 Mbps, Protocol V2 |
| **Chip I2C addresses** | ❌ | ✅ codec 0x18 / ToF 0x29 / BMI088 0x19 |
| **IMU data block layout** | ❌ | ✅ register 124, 12 bytes, byte by byte |
| **Assembly geometry** | ❌ | ✅ exploded views + CAD assembly |
| **Fasteners** | ❌ | ✅ M2 system, reconstructed from a hole scan |

---

## 4. What the community has already built (within 4 days of launch)

All verifiable public projects:

| Author | What | Response |
|---|---|---|
| [@onusoz](https://x.com/onusoz/status/2093763495846441348) | Trained a 1.3 M-parameter small LLM to emit emotion labels, then used a **Rust synthesiser** to procedurally generate R2-D2 style sound effects, running in the browser | 543 ♥ |
| [@Thom_Wolf](https://x.com/Thom_Wolf/status/2092959363992326236) | Vibe-coded an image-detection integration so the robot **tracks a laser pointer** | 3,065 ♥ |
| [@cdngdev](https://x.com/cdngdev/status/2093721082582933639) | Trained it to play a "find one needle in 5 million pieces of hay" game | 852 ♥ |
| Anonymous | Trained a **somersault** (reposted by Clem) | 3,714 ♥ |
| [@__Rhodium__](https://x.com/__Rhodium__/status/2093404140454265205) | Trained **breakdancing** | 610 ♥ |

> This shows the platform is genuinely playful and the barrier to building on it is low - all of these were made within days of getting the software stack.

---

## 5. What the community is asking for on GitHub

| Issue | Request | Official reply |
|---|---|---|
| [#175](https://github.com/pollen-robotics/microduck/issues/175) | **STEP files** - STLs carry no line information; curved surfaces render as polygon blocks | ❌ none |
| [#173](https://github.com/pollen-robotics/microduck/issues/173) | **3D-print source files** | ❌ none |
| [#174](https://github.com/pollen-robotics/microduck/issues/174) | Whether the battery can be charged in place + **whether the power-board schematic is on the open-source roadmap** | ❌ none |

Across nearly 10 issues checked, **no upstream maintainer has replied to a single one**, yet the repository is still updated daily (a dev build was still published on 8/30).

**Official position** (as quoted by CNX Software):
> *"Pollen Robotics told the press not to refer to the robot as
> 'open-source hardware' **(for now)**."*

What the vendor declined is the **label** "open-source hardware"; that does not mean no board has been released -
**the HAT board is in fact fully open** ([`elec_RPI_Robot_HAT`](https://github.com/pollen-robotics/elec_RPI_Robot_HAT),
Apache-2.0). What is not published is the `imu_to_dxl` board, editable mechanical CAD and a whole-robot BOM.
"(for now)" leaves the door open, with no timeline.

> Correction 2026-09-03: the earlier summary here was inaccurate and has been fixed.

---

## 6. ⚠️ Noise and risk

### Meme coins riding the hype

Tokens such as `$microduck`, `$MACRODUCK` and `$Microdino` are piling onto this wave.
A sizeable share of search results is token promotion, **unrelated to the project itself**.

### 🔴 "Microdino" - not recommended

On X, [@davidfeldt](https://x.com/davidfeldt/status/2093491570867884322) claims to have built a
"same-spec" Microdino (550 likes). From the replies:

- Multiple people call it a scam: *"Carefull this guys is scamer"*, *"Scam"*
- Someone asks: *"Why did you scrap the first token and mint another one?"*
- Asked *"does it have the full CAD design?"*, the answer is evasive: *"You can generate the CAD after"*
- Asked whether there is a sim2real model: *"Not yet but soon!"*
- The replies include people posting the $Microdino contract address directly

**Conclusion: not a credible open-source hardware project. Macrodork does not cite any of its content.**

### 🔴 Unconfirmed rumours

- "NVIDIA acquires Hugging Face for $12.9 billion" - posted by a meme-coin promotion account, **no reliable source whatsoever**
- "Proxy buyers in Japan face a wait of about 10 months" - a single user's claim, unverified

---

## 7. What this means for Macrodork

1. **The teardown conclusions have been independently validated** - the single most important call, the Radxa Zero 3W, was confirmed independently by someone else
2. **With no physical units available, this repository's analysis sits at the frontier of public information** - one layer deeper than the community spec lists
3. **What the community is asking for (STEP, print source files, schematics) is exactly the direction this repository is working in** - the target readership clearly exists
4. **Pseudo-open-source projects riding the hype need to be watched for** - Macrodork sets itself apart by citing the evidence behind every conclusion
