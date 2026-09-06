# Longshot

A two-minute sniper game for Apple Vision Pro: a voxel valley, patrolling tanks, look at one and
pinch to send a missile. Spec in `../BRD.md`, build plan in `../AGENT-PROMPT.md`, status in
`../PROGRESS.md`.

## Build

Requires Xcode 26 with the visionOS SDK and [XcodeGen](https://github.com/yonaskolb/XcodeGen).
The `.xcodeproj` is generated and not committed.

```bash
xcodegen generate
xcodebuild -project Longshot.xcodeproj -scheme Longshot \
  -destination 'generic/platform=visionOS Simulator' -derivedDataPath .build build
```

## Run in the simulator

```bash
open -a Simulator
xcrun simctl boot "Apple Vision Pro" 2>/dev/null || true
xcodebuild -project Longshot.xcodeproj -scheme Longshot \
  -destination 'platform=visionOS Simulator,name=Apple Vision Pro' -derivedDataPath .build build
xcrun simctl install booted .build/Build/Products/Debug-xrsimulator/Longshot.app
xcrun simctl launch booted ai.offside.avp.Longshot
```

In the simulator, look with the mouse and click to pinch. Press Deploy in the Longshot window.

## Layout

| Path | Role |
|---|---|
| `Longshot/LongshotApp.swift` | Window group and immersive space |
| `Longshot/Game/` | `GameState` (round, clock, score) and pure `Scoring` rules |
| `Longshot/Views/` | Menu window and head-anchored HUD |
| `Longshot/World/` | `Battlefield` coordinator, `Heightmap`, `TerrainBuilder`, `SkyBuilder`, `TankFactory`, `PlayerRig`, `BattlefieldView` |
| `Longshot/Systems/` | Tank patrol and spawning, missiles, effects and debris (extensions on `Battlefield`) |
| `Longshot/Audio/` | Synthesised explosion and launch sounds |
| `Longshot/Support/` | SIMD helpers and a seeded RNG |

Everything is generated in code. There are no art or audio assets and no dependencies.
