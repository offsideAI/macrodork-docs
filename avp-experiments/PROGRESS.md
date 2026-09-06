# Longshot progress

## 2026-09-04 · M1 to M4 implemented, first successful build

**Built.** The whole vertical slice from `AGENT-PROMPT.md` milestones M1 through M4 is written and
compiles for the visionOS 26.5 simulator with Xcode 26.5 (`xcodegen generate` then `xcodebuild`).

- App shell: menu window, fully immersive space, Deploy / Deploy again / Exit wiring.
- World: seeded value-noise heightmap with a ridge under the player, a valley 60 to 320 m ahead and
  hills beyond; 640 m square of 4 m voxels in 16 chunk meshes with exposed faces only and five
  altitude-band materials; sky dome, haze ring, sun and a directional key light.
- Player rig: head anchor carrying a reticle and the SwiftUI HUD attachment.
- Tanks: five-part boxy tank with an oversized collider, hover highlight and patrol component;
  spawn on the valley floor, patrol inside a 45 m zone, follow the terrain height.
- Targeting: `SpatialTapGesture().targetedToAnyEntity()`; taps on tanks launch a guided missile,
  taps elsewhere hit an invisible far-field collider and the shot is ray-marched to the terrain.
- Missiles: cylinder and cone body with a particle trail, arc to a tracked target in 0.6 to 1.9 s,
  cooldown 0.8 s, at most two in flight.
- Effects: unlit flash that scales and fades, particle burst, smoke column that stops emitting after
  3.5 s, the tank's own parts flung as debris with gravity and tumble, wreck cleared at 6.5 s.
- Audio: explosion and launch clips synthesised at start-up, written as WAV to the temp directory,
  played spatially from the impact point.
- Round: 120 s clock, scoring per BRD F11, respawn after 3 s keeping 3 to 5 tanks, debrief in the HUD
  and the menu window, best score in `UserDefaults`.

**Tested.** Compilation only. Nothing has run in the simulator yet; the owner runs the app.

**Not yet done.**
- M5 polish: colour and distance tuning after a first play, miss feedback wording, streak display
  check, two consecutive rounds without a stuck state.
- M6 optional hand-ray aiming.
- Unit tests for `Scoring` and `Heightmap` (no test target yet).

**Known risks to check in the first run.**
- Particle emitter property names compiled, but visual scale at 200 m has not been seen.
- The far-field miss collider is a set of large box shapes; if a pinch on empty sky does nothing, the
  ray from inside the shapes is not registering and the fallback is a single large plane collider
  below the terrain plus a sky-only miss.
- `AnchorEntity(.head)` HUD placement may need its offset tuned for comfort.
- Terrain triangle count is printed to the console on first build of the scene; target is under 150k.
