# Longshot: Business Requirements Document

**Platform:** Apple Vision Pro (visionOS 26, fully immersive)
**Project folder:** `avp-experiments/Longshot/`
**Status:** Draft 1, 2026-09-04. Open questions at the end need an answer from the product owner; the build proceeds on the stated assumptions until then.

## 1. Summary

Longshot is a short, replayable first-person sniper game for Apple Vision Pro. The player lies on a ridge above a wide, blocky, voxel-style battlefield. Tanks patrol the valley in the far distance. The player looks at a tank through the rifle's sight and pinches to release a guided missile. The missile arcs across the valley, strikes the tank and blows it apart. A round lasts two minutes; the score is tanks destroyed, with a bonus for accuracy and streaks.

It is deliberately not a complicated game. There is one weapon, one enemy type, one map and one mode. The point of the project is to exercise the visionOS immersive-space stack end to end: full immersion, RealityKit procedural content, gaze-and-pinch targeting, head-anchored HUD, spatial audio and a SwiftUI menu that opens and closes the immersive space.

## 2. Goals

1. Ship a build that runs in the visionOS simulator and on device, from a fresh clone, with one command.
2. Demonstrate the core visionOS interaction: look at a distant target, pinch, see a consequence in the world.
3. Keep every asset procedural (terrain, tanks, missile, effects, sound), so the project has no binary art dependencies and no third-party licences.
4. Keep the codebase small enough to read in one sitting: under 1,500 lines of Swift.

Non-goals: multiplayer, progression, an inventory, story, enemy fire, realistic ballistics, any licensed military likenesses.

## 3. Player experience

### 3.1 Flow

1. **Menu window.** The app launches to a small glass window: title, one-paragraph briefing, best score, a **Deploy** button.
2. **Deploy.** The window is replaced by the fully immersive battlefield. The player is standing on a ridge; the valley opens in front of them. Tanks are already moving in the distance.
3. **Play.** A round is 120 seconds. The player looks at a tank; the system hover effect highlights it. Pinch fires. A missile launches from the rifle position at the player's lower right, arcs to the target, and explodes. Destroyed tanks are replaced after a delay so there are always three to five targets in the field. A HUD at the bottom of the view shows time, score, tanks destroyed and current streak.
4. **Debrief.** At zero seconds the world freezes, an end card appears in the HUD with the round's numbers, and the menu window returns with **Deploy again** and **Exit**.

### 3.2 Look and feel

- **Landscape.** A voxel terrain: cubes on a grid, heights stepped, colour banded by altitude (grass, scorched earth, rock, snow). A ridge under the player, a wide valley in front, hills on the far side, a haze layer at the horizon. Think blocky diorama rather than photoreal battlefield. Inspiration is the open-landscape feel of large military shooters, executed in a voxel idiom; nothing is copied from any title.
- **Tanks.** Boxy, readable at distance: hull, tracks, turret, barrel. Dark olive with a lighter turret so they separate from the ground. They patrol slowly and turn at the edges of their zone.
- **Missile.** A thin cylinder with a cone nose, a short smoke trail, a slight upward arc, about 1.5 seconds of flight to the far targets.
- **Explosion.** A flash, a particle burst, the tank's parts flung outward and tumbling, a smoke column that fades over a few seconds, a spatialised bang from the impact point.
- **HUD.** Minimal: four numbers on a glass strip, plus a reticle. Nothing else in the view.

## 4. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| F1 | App presents a SwiftUI menu window with Deploy, and opens a fully immersive space on Deploy | Must |
| F2 | Terrain is generated procedurally at launch from a seeded heightmap, rendered as voxel geometry, at least 500 m across | Must |
| F3 | Player position is on a ridge at least 15 m above the valley floor, with a clear line of sight to the target zone | Must |
| F4 | Three to five tanks are present at all times during a round, at 120 m to 320 m from the player | Must |
| F5 | Tanks move along patrol paths at 2 to 4 m/s and turn within their zone | Must |
| F6 | Looking at a tank produces the system hover highlight | Must |
| F7 | A pinch while looking at a tank launches a missile that flies to that tank and destroys it | Must |
| F8 | A pinch while not looking at a tank launches a missile at the gazed point and counts as a miss | Must |
| F9 | A destroyed tank explodes: flash, particle burst, debris, smoke, sound; the wreck is removed after 6 s and a new tank spawns elsewhere after 3 s | Must |
| F10 | A HUD anchored to the player's view shows time remaining, score, tanks destroyed, streak | Must |
| F11 | Score: 100 per tank, streak bonus of 25 × (streak − 1) capped at 200, minus 10 per miss (never below 0) | Must |
| F12 | Round ends at 120 s; debrief shows tanks, missiles, accuracy, score, best score; best score persists between launches | Must |
| F13 | Exit from debrief or from the menu dismisses the immersive space and returns to the window | Must |
| F14 | Fire cooldown of 0.8 s; at most two missiles in flight | Should |
| F15 | Reticle in the centre of view, subtle, does not occlude targets | Should |
| F16 | Optional hand-ray aiming: on device, the index finger direction can aim instead of gaze, selectable in the menu | Could |
| F17 | Ambient audio: wind loop, distant engine rumble | Could |

## 5. Non-functional requirements

- **Frame rate.** 90 Hz on device with no dropped frames during an explosion. Terrain in a handful of merged meshes, not one entity per cube.
- **Startup.** Immersive space presents within 2 s of Deploy on device.
- **Comfort.** No camera motion is ever applied; the player's head is the camera. No screen-space flashes above 50 percent white. Explosions are at distance.
- **Accessibility.** Pinch is the only required input; no hand-ray requirement. Text in the HUD is at least 24 pt at the anchored distance.
- **Privacy.** No hand-tracking permission is requested unless F16 is enabled by the player. No network access. No analytics.
- **Compatibility.** visionOS 26 SDK, deployment target visionOS 2.0, Swift 6 toolchain in Swift 5 language mode.
- **Reproducibility.** `xcodegen generate` followed by `xcodebuild` on the simulator destination must succeed on a clean checkout.

## 6. Technical approach

- **App shell.** SwiftUI `App` with one `WindowGroup` (menu) and one `ImmersiveSpace` with `.full` immersion style. Game state in an `@Observable` class shared through the environment.
- **World.** `RealityView` builds a root entity: sky dome, terrain chunks, tank entities, an invisible far-field collider so misses register, a head `AnchorEntity` carrying the reticle and the HUD attachment.
- **Terrain.** Value-noise heightmap, quantised to voxel steps, converted to one `MeshDescriptor` per chunk with only exposed faces emitted and per-face material indices for altitude bands.
- **Targeting.** `SpatialTapGesture().targetedToAnyEntity()`. Tanks carry `InputTargetComponent`, an oversized `CollisionComponent` for forgiving selection at distance, and `HoverEffectComponent` for the gaze highlight. The tap location is converted to scene space for the miss case.
- **Simulation.** A `SceneEvents.Update` subscription drives tank patrols, missile flight, debris and effect lifetimes with a fixed maximum delta.
- **Effects.** `ParticleEmitterComponent` presets for burst and smoke; `OpacityComponent` fades; debris are the tank's own child boxes given velocities.
- **Audio.** A short explosion sample synthesised at launch (noise burst with exponential decay), written to a temporary WAV and loaded as an `AudioFileResource`, played from the impact entity for spatialisation.
- **Persistence.** `UserDefaults` for best score.
- **Project generation.** XcodeGen `project.yml`; no committed `.xcodeproj`.

## 7. Milestones

| M | Deliverable | Exit test |
|---|---|---|
| M1 | Project scaffold, menu window, immersive space opens and closes, flat ground, sky | Builds for simulator; Deploy shows a horizon; Exit returns |
| M2 | Voxel terrain with ridge and valley, haze, reticle, HUD strip | Terrain visible to 500 m; HUD readable; 90 Hz in simulator profiler |
| M3 | Tanks with patrol, hover highlight, gaze-and-pinch fires a missile that reaches the target | Tapping a tank removes it |
| M4 | Explosion effects, debris, sound, respawn, scoring, timer, debrief, best score | Full round playable start to finish |
| M5 | Polish: fire cooldown, streaks, miss feedback, tuning of distances and colours | Two consecutive rounds without a crash or a stuck state |
| M6 | Optional hand-ray aiming behind a menu toggle | Works on device; simulator falls back to gaze |

## 8. Assumptions to confirm

1. "Voxel style" is the intended reading of the requested landscape style: blocky cubes, stepped heights, flat colours.
2. "Missile" is the intended weapon, launched by the player, guided to the target. Not a bullet.
3. Aiming is by gaze (look at the tank) with a pinch to fire, which is the native visionOS interaction. Pointing with a hand is an optional extra, not the primary control.
4. The player stands rather than lies prone; visionOS anchors the world to the real floor, so a lying pose cannot be simulated.
5. No enemy fire and no player health. The only pressure is the clock.
6. The game has no title yet; "Longshot" is a placeholder chosen to avoid trademarks.

## 9. Out of scope for this draft

App Store submission assets, localisation, Game Center, accessibility audit beyond the basics above, and any real-world military vehicle likeness.
