# Implementation prompt: build Longshot end to end

You are implementing the game specified in `BRD.md` in this folder. Work through the milestones in order. Do not open Xcode; generate the project with XcodeGen and build with `xcodebuild` against the visionOS simulator. Never run the simulator app yourself; hand the launch command to the owner.

## Ground rules

- Everything lives under `avp-experiments/Longshot/`. The generated `Longshot.xcodeproj` is not committed; `project.yml` is.
- Swift 6 toolchain, Swift 5 language mode (`SWIFT_VERSION = 5.0`) to keep RealityKit and SwiftUI code free of strict-concurrency friction. All RealityKit and game-state mutation happens on the main actor.
- No binary assets. Terrain, tanks, missile, effects and sound are generated in code. No Reality Composer Pro package.
- No third-party dependencies.
- Keep files short: no file over 250 lines, no function over 60 lines. Split by responsibility: app shell, views, world building, simulation systems, effects, audio, math.
- Every milestone ends with a successful `xcodebuild` and a note in `PROGRESS.md` (in this folder) recording what was built, what was tested, and what is next.

## Commands

```bash
cd avp-experiments/Longshot
xcodegen generate
xcodebuild -project Longshot.xcodeproj -scheme Longshot \
  -destination 'generic/platform=visionOS Simulator' \
  -derivedDataPath .build build 2>&1 | tail -30
```

Launch for the owner to run themselves (do not run it yourself):

```bash
open -a Simulator
xcrun simctl boot "Apple Vision Pro" 2>/dev/null || true
xcodebuild -project Longshot.xcodeproj -scheme Longshot \
  -destination 'platform=visionOS Simulator,name=Apple Vision Pro' -derivedDataPath .build build
xcrun simctl install booted .build/Build/Products/Debug-xrsimulator/Longshot.app
xcrun simctl launch booted ai.offside.avp.Longshot
```

## Architecture to implement

```
Longshot/
  LongshotApp.swift            App: WindowGroup("menu") + ImmersiveSpace("battlefield"), .full immersion
  Game/GameState.swift          @Observable: phase, clock, score, streak, counters, best score, tuning constants
  Game/Scoring.swift            Pure functions for hit/miss scoring and accuracy
  Views/MenuView.swift          Briefing, Deploy / Deploy again / Exit, best score
  Views/HUDView.swift           Time, score, tanks, streak; end card when phase == .debrief
  World/BattlefieldView.swift   RealityView: builds root, subscribes to updates, handles SpatialTapGesture
  World/SkyBuilder.swift        Inverted sphere sky, sun disc, horizon haze ring
  World/TerrainBuilder.swift    Heightmap -> chunked MeshDescriptor voxel meshes with per-face materials
  World/Heightmap.swift         Seeded value noise, ridge and valley shaping, height sampling
  World/TankFactory.swift       Builds a tank entity from boxes; oversized collider; hover effect
  World/PlayerRig.swift         Head anchor: reticle, HUD attachment placement, muzzle position helper
  Systems/TankPatrolSystem.swift  Moves tanks, turns at zone edges, keeps them on the terrain surface
  Systems/MissileSystem.swift     Spawns missiles, arcs them to targets, detects arrival, triggers hits/misses
  Systems/EffectsSystem.swift     Explosion flash, particles, debris physics-lite, smoke, lifetimes
  Audio/SynthAudio.swift          Generates explosion WAV at launch, loads AudioFileResource, plays spatially
  Support/Math.swift              SIMD helpers, lerp, clamp, seeded RNG
```

## Milestone checklist

**M1 Scaffold.** `project.yml` (visionOS application target, bundle id `ai.offside.avp.Longshot`, generated Info.plist with `UIApplicationSupportsMultipleScenes = YES` and the scene manifest), `LongshotApp`, `GameState` skeleton, `MenuView` with Deploy and Exit wired to `openImmersiveSpace` / `dismissImmersiveSpace`, `BattlefieldView` with a flat ground plane and sky. Build passes.

**M2 World.** `Heightmap` (value noise, 4 octaves, ridge under the player, valley 60 to 300 m ahead, hills beyond), `TerrainBuilder` (4 m voxels, 2 m height steps, 640 m square, chunked 4 × 4, exposed faces only, per-face materials for four altitude bands), `SkyBuilder`, `PlayerRig` reticle and HUD attachment. Terrain surface under the player is at y = 0. Build passes; document triangle count.

**M3 Targeting.** `TankFactory`, `TankPatrolSystem`, `MissileSystem` with `SpatialTapGesture().targetedToAnyEntity()`; tanks have `InputTargetComponent`, `CollisionComponent` (box 1.6 × actual), `HoverEffectComponent`; a far-field sphere collider around the player captures misses. Missile arcs to the target in about 1.5 s. On arrival, the tank is removed. Build passes.

**M4 Round.** `EffectsSystem` (flash sphere scaling and fading, `ParticleEmitterComponent` burst and smoke, debris from the tank's own parts with velocity and tumble, wreck removal at 6 s), `SynthAudio`, respawn after 3 s keeping 3 to 5 tanks, `Scoring`, 120 s clock, debrief in HUD and menu, best score in `UserDefaults`. Build passes; full round is playable in the simulator by the owner.

**M5 Polish.** Cooldown 0.8 s, max two missiles in flight, miss puff at the gazed point, streak display, colour and distance tuning, haze. Two rounds back to back without a stuck state.

**M6 Optional.** Hand-ray aiming behind a menu toggle using ARKit `HandTrackingProvider`; add the usage-description key only when this milestone is built; simulator falls back to gaze.

## Acceptance

The project is done when a reviewer can clone the repository, run the two commands above, deploy into the battlefield in the simulator, destroy a tank by clicking it, see the explosion, hear the bang, watch the timer run out, read the debrief, and deploy again.
