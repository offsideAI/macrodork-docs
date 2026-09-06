import RealityKit
import SwiftUI

/// Owns the world: builds it, runs the per-frame update, and dispatches taps.
/// Systems live in extensions: TankSystem, MissileSystem, EffectsSystem.
@MainActor
final class Battlefield {
    let game: GameState
    let map = Heightmap(seed: 20260904)
    let root = Entity()
    let head = PlayerRig.makeHeadAnchor()
    var rng = SeededRNG(seed: 7)

    var tanks: [Entity] = []
    var missiles: [Missile] = []
    var effects: [TimedEffect] = []
    var debris: [Debris] = []
    var pendingSpawns: [TimeInterval] = []
    var nextTankID = 0
    var lastFireTime: TimeInterval = -10
    var clock: TimeInterval = 0
    var subscription: EventSubscription?
    let audio = SynthAudio()

    init(game: GameState) {
        self.game = game
        TankComponent.registerComponent()
    }

    // MARK: - Build

    func build(into content: RealityViewContent, attachments: RealityViewAttachments) {
        root.name = "battlefield"
        root.addChild(SkyBuilder.build())
        do {
            let terrain = try TerrainBuilder.build(map)
            terrain.entities.forEach { root.addChild($0) }
            print("Longshot terrain: \(terrain.entities.count) chunks, \(terrain.triangles) triangles")
        } catch {
            print("Longshot terrain failed: \(error)")
        }
        root.addChild(makeMissWalls())
        content.add(root)

        if let hud = attachments.entity(for: "hud") {
            hud.position = PlayerRig.hudOffset
            head.addChild(hud)
        }
        content.add(head)

        while tanks.count < game.minTanks { spawnTank() }

        subscription = content.subscribe(to: SceneEvents.Update.self) { [weak self] event in
            self?.update(dt: min(event.deltaTime, 1.0 / 30.0))
        }
    }

    /// Invisible slabs far out, so a pinch that misses every tank still lands somewhere.
    private func makeMissWalls() -> Entity {
        let walls = Entity()
        walls.name = "misswalls"
        walls.components.set(InputTargetComponent())
        var shapes: [ShapeResource] = []
        let radius: Float = 850
        for k in 0..<8 {
            let a = Float(k) / 8 * 2 * .pi
            let center = SIMD3<Float>(cos(a) * radius, 120, sin(a) * radius)
            let rot = simd_quatf(angle: -a, axis: .up)
            shapes.append(ShapeResource.generateBox(size: [12, 1400, 700]).offsetBy(rotation: rot, translation: center))
        }
        shapes.append(ShapeResource.generateBox(size: [1800, 10, 1800]).offsetBy(translation: [0, -140, 0]))
        shapes.append(ShapeResource.generateBox(size: [1800, 10, 1800]).offsetBy(translation: [0, 900, 0]))
        walls.components.set(CollisionComponent(shapes: shapes))
        return walls
    }

    // MARK: - Update

    func update(dt: TimeInterval) {
        clock += dt
        game.tick(dt)
        let running = game.phase == .playing
        if running {
            updateTanks(dt: Float(dt))
            processSpawns()
        }
        updateMissiles(dt: Float(dt))
        updateDebris(dt: Float(dt))
        updateEffects()
    }

    // MARK: - Input

    /// A pinch landed on `entity` at `point` (scene space).
    func handleTap(entity: Entity, at point: SIMD3<Float>) {
        guard game.phase == .playing else { return }
        guard clock - lastFireTime >= game.fireCooldown, missiles.count < game.maxMissilesInFlight else { return }
        lastFireTime = clock
        if let tank = tankRoot(of: entity), tank.components[TankComponent.self]?.alive == true {
            launchMissile(at: tank.position(relativeTo: nil) + [0, 3, 0], tank: tank)
        } else {
            launchMissile(at: groundPoint(toward: point), tank: nil)
        }
        game.registerFire()
    }

    private func tankRoot(of entity: Entity) -> Entity? {
        var e: Entity? = entity
        while let cur = e {
            if cur.components.has(TankComponent.self) { return cur }
            e = cur.parent
        }
        return nil
    }

    /// Where a shot at `point` actually meets the terrain (or the sky, 600 m out).
    private func groundPoint(toward point: SIMD3<Float>) -> SIMD3<Float> {
        let origin = PlayerRig.headPosition(head: head)
        let dir = simd_normalize(point - origin)
        var t: Float = 6
        while t < 900 {
            let p = origin + dir * t
            if abs(p.x) < map.size / 2 && abs(p.z) < map.size / 2, p.y <= map.height(x: p.x, z: p.z) { return p }
            t += 3
        }
        return origin + dir * 600
    }
}
