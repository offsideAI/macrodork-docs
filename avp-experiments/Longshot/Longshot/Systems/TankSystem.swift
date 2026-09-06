import RealityKit
import simd

/// Spawning, patrol movement and destruction bookkeeping for tanks.
extension Battlefield {
    func spawnTank() {
        guard let position = findSpawnPosition() else { return }
        var comp = TankComponent(
            heading: rng.range(0...(2 * .pi)),
            speed: rng.range(2...4),
            zoneCenter: position,
            zoneRadius: 45
        )
        comp.alive = true
        let tank = TankFactory.make(id: nextTankID, tank: comp)
        nextTankID += 1
        tank.position = position
        tank.orientation = yawRotation(comp.heading)
        root.addChild(tank)
        tanks.append(tank)
    }

    /// Valley floor, 120 to 320 m ahead, spaced from other tanks.
    private func findSpawnPosition() -> SIMD3<Float>? {
        for _ in 0..<60 {
            let x = rng.range(-170...170)
            let z = -rng.range(120...320)
            let y = map.height(x: x, z: z)
            guard y < -14 else { continue }
            let p = SIMD3<Float>(x, y, z)
            if tanks.allSatisfy({ horizontalDistance($0.position, p) > 28 }) { return p }
        }
        return nil
    }

    func updateTanks(dt: Float) {
        for tank in tanks {
            guard var comp = tank.components[TankComponent.self], comp.alive else { continue }
            let toCenter = comp.zoneCenter - tank.position
            if horizontalDistance(tank.position, comp.zoneCenter) > comp.zoneRadius {
                let desired = atan2(-toCenter.z, toCenter.x)
                comp.heading = turnToward(comp.heading, desired, maxDelta: 0.9 * dt)
            } else {
                comp.heading += rng.range(-0.25...0.25) * dt
            }
            let step = SIMD3<Float>(cos(comp.heading), 0, -sin(comp.heading)) * comp.speed * dt
            var next = tank.position + step
            next.y = map.height(x: next.x, z: next.z)
            tank.position = next
            tank.orientation = yawRotation(comp.heading)
            tank.components.set(comp)
        }
    }

    private func turnToward(_ current: Float, _ target: Float, maxDelta: Float) -> Float {
        var d = target - current
        while d > .pi { d -= 2 * .pi }
        while d < -.pi { d += 2 * .pi }
        return current + clamp(d, -maxDelta, maxDelta)
    }

    func processSpawns() {
        pendingSpawns.removeAll { due in
            guard clock >= due else { return false }
            if tanks.count < game.maxTanks { spawnTank() }
            return true
        }
        if tanks.count < game.minTanks && pendingSpawns.isEmpty { spawnTank() }
    }

    /// Called by the missile system when a missile reaches a tank.
    func destroyTank(_ tank: Entity) {
        guard var comp = tank.components[TankComponent.self], comp.alive else { return }
        comp.alive = false
        tank.components.set(comp)
        tank.components.remove(InputTargetComponent.self)
        tank.components.remove(HoverEffectComponent.self)
        tank.components.remove(CollisionComponent.self)
        tanks.removeAll { $0 === tank }
        pendingSpawns.append(clock + 3)
        explode(tank)
        game.registerHit()
    }
}
