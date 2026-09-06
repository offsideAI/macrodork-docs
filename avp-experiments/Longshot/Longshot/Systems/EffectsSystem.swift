import RealityKit
import UIKit

struct TimedEffect {
    let entity: Entity
    let born: TimeInterval
    let lifetime: TimeInterval
    var onTick: ((Entity, Float) -> Void)?   // progress 0..1
}

struct Debris {
    let entity: Entity
    var velocity: SIMD3<Float>
    var spin: simd_quatf
    let born: TimeInterval
}

/// Explosions, miss puffs, debris and lifetimes. Everything here is cosmetic.
extension Battlefield {
    static let flashMaterial = UnlitMaterial(color: UIColor(red: 1.0, green: 0.72, blue: 0.3, alpha: 1))

    func explode(_ tank: Entity) {
        let center = tank.position(relativeTo: nil) + [0, 3, 0]
        addFlash(at: center, radius: 7)
        addBurst(at: center, count: 420, speed: 22, size: 2.6)
        addSmokeColumn(at: center, seconds: 3.5)
        scatterParts(of: tank)
        audio.playExplosion(at: center, parent: root)
        effects.append(TimedEffect(entity: tank, born: clock, lifetime: 6.5, onTick: nil))
    }

    func missImpact(at point: SIMD3<Float>) {
        addFlash(at: point, radius: 3)
        addBurst(at: point, count: 160, speed: 12, size: 1.6)
        audio.playExplosion(at: point, parent: root, gain: -8)
    }

    private func addFlash(at position: SIMD3<Float>, radius: Float) {
        let flash = ModelEntity(mesh: .generateSphere(radius: radius), materials: [Battlefield.flashMaterial])
        flash.position = position
        flash.scale = [0.2, 0.2, 0.2]
        flash.components.set(OpacityComponent(opacity: 1))
        root.addChild(flash)
        effects.append(TimedEffect(entity: flash, born: clock, lifetime: 0.45) { e, p in
            let s = 0.2 + 1.4 * smoothstep(min(1, p * 2))
            e.scale = [s, s, s]
            e.components.set(OpacityComponent(opacity: 1 - p * p))
        })
    }

    private func addBurst(at position: SIMD3<Float>, count: Int, speed: Float, size: Float) {
        let e = Entity()
        e.position = position
        var p = ParticleEmitterComponent()
        p.emitterShape = .sphere
        p.emitterShapeSize = [1.5, 1.5, 1.5]
        p.birthLocation = .volume
        p.birthDirection = .normal
        p.speed = speed
        p.speedVariation = speed * 0.5
        p.burstCount = count
        p.mainEmitter.birthRate = 0
        p.mainEmitter.lifeSpan = 1.6
        p.mainEmitter.lifeSpanVariation = 0.5
        p.mainEmitter.size = size
        p.mainEmitter.sizeVariation = size * 0.4
        p.mainEmitter.color = .evolving(
            start: .single(UIColor(red: 1.0, green: 0.6, blue: 0.15, alpha: 1)),
            end: .single(UIColor(red: 0.25, green: 0.22, blue: 0.2, alpha: 0))
        )
        p.mainEmitter.opacityCurve = .linearFadeOut
        e.components.set(p)
        root.addChild(e)
        e.components[ParticleEmitterComponent.self]?.burst()
        effects.append(TimedEffect(entity: e, born: clock, lifetime: 3, onTick: nil))
    }

    private func addSmokeColumn(at position: SIMD3<Float>, seconds: TimeInterval) {
        let e = Entity()
        e.position = position
        var p = ParticleEmitterComponent()
        p.emitterShape = .sphere
        p.emitterShapeSize = [2, 2, 2]
        p.birthLocation = .volume
        p.birthDirection = .world
        p.emissionDirection = [0, 1, 0]
        p.speed = 4
        p.speedVariation = 2
        p.mainEmitter.birthRate = 70
        p.mainEmitter.lifeSpan = 4
        p.mainEmitter.size = 3.5
        p.mainEmitter.sizeVariation = 1.2
        p.mainEmitter.color = .evolving(
            start: .single(UIColor(white: 0.2, alpha: 0.85)),
            end: .single(UIColor(white: 0.5, alpha: 0))
        )
        p.mainEmitter.opacityCurve = .linearFadeOut
        e.components.set(p)
        root.addChild(e)
        effects.append(TimedEffect(entity: e, born: clock, lifetime: seconds + 5) { e, progress in
            if Double(progress) * (seconds + 5) > seconds, var comp = e.components[ParticleEmitterComponent.self], comp.isEmitting {
                comp.isEmitting = false
                e.components.set(comp)
            }
        })
    }

    /// The tank's own parts become debris: re-parented to the world with velocity and tumble.
    private func scatterParts(of tank: Entity) {
        for part in tank.children.reversed() {
            let world = part.position(relativeTo: nil)
            let rot = part.orientation(relativeTo: nil)
            part.removeFromParent()
            part.position = world
            part.orientation = rot
            root.addChild(part)
            let dir = simd_normalize(SIMD3<Float>(rng.range(-1...1), rng.range(0.8...1.6), rng.range(-1...1)))
            let spin = simd_quatf(angle: rng.range(2...7), axis: simd_normalize(SIMD3<Float>(rng.range(-1...1), rng.range(-1...1), rng.range(-1...1))))
            debris.append(Debris(entity: part, velocity: dir * rng.range(10...22), spin: spin, born: clock))
        }
    }

    func updateDebris(dt: Float) {
        for i in debris.indices {
            debris[i].velocity.y -= 9.8 * dt
            let e = debris[i].entity
            e.position += debris[i].velocity * dt
            let ground = map.height(x: e.position.x, z: e.position.z) + 0.6
            if e.position.y < ground {
                e.position.y = ground
                debris[i].velocity = SIMD3<Float>(debris[i].velocity.x * 0.5, 0, debris[i].velocity.z * 0.5)
            } else {
                e.orientation = simd_slerp(e.orientation, e.orientation * debris[i].spin, dt)
            }
        }
        debris.removeAll { d in
            guard clock - d.born > 6.5 else { return false }
            d.entity.removeFromParent()
            return true
        }
    }

    func updateEffects() {
        effects.removeAll { fx in
            let progress = Float((clock - fx.born) / fx.lifetime)
            if progress >= 1 {
                fx.entity.removeFromParent()
                return true
            }
            fx.onTick?(fx.entity, progress)
            return false
        }
    }
}
