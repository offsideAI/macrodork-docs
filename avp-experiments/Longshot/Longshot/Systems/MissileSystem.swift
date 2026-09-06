import RealityKit
import UIKit

struct Missile {
    let entity: Entity
    let start: SIMD3<Float>
    let target: SIMD3<Float>
    let tank: Entity?
    let duration: Float
    var t: Float = 0
}

/// Launches missiles from the shouldered position and flies them on an arc to the target.
extension Battlefield {
    static let missileBody = SimpleMaterial(color: UIColor(white: 0.85, alpha: 1), roughness: 0.4, isMetallic: true)
    static let missileNose = SimpleMaterial(color: UIColor(red: 0.85, green: 0.2, blue: 0.15, alpha: 1), roughness: 0.5, isMetallic: false)

    func launchMissile(at target: SIMD3<Float>, tank: Entity?) {
        let start = PlayerRig.muzzlePosition(head: head)
        let entity = makeMissileEntity()
        entity.position = start
        root.addChild(entity)
        let distance = simd_length(target - start)
        let duration = clamp(distance / 220, 0.6, 1.9)
        missiles.append(Missile(entity: entity, start: start, target: target, tank: tank, duration: duration))
        audio.playLaunch(from: entity)
    }

    private func makeMissileEntity() -> Entity {
        let e = Entity()
        e.name = "missile"
        let body = ModelEntity(mesh: .generateCylinder(height: 1.6, radius: 0.09), materials: [Battlefield.missileBody])
        body.orientation = simd_quatf(angle: -.pi / 2, axis: [1, 0, 0])  // cylinder along -Z (forward)
        let nose = ModelEntity(mesh: .generateCone(height: 0.45, radius: 0.09), materials: [Battlefield.missileNose])
        nose.orientation = simd_quatf(angle: -.pi / 2, axis: [1, 0, 0])
        nose.position = [0, 0, -1.02]
        e.addChild(body)
        e.addChild(nose)
        e.components.set(makeTrail())
        return e
    }

    private func makeTrail() -> ParticleEmitterComponent {
        var p = ParticleEmitterComponent()
        p.emitterShape = .point
        p.birthLocation = .surface
        p.speed = 2
        p.speedVariation = 1
        p.mainEmitter.birthRate = 260
        p.mainEmitter.lifeSpan = 0.9
        p.mainEmitter.size = 0.35
        p.mainEmitter.sizeVariation = 0.15
        p.mainEmitter.color = .evolving(
            start: .single(UIColor(white: 0.95, alpha: 0.9)),
            end: .single(UIColor(white: 0.7, alpha: 0))
        )
        p.mainEmitter.opacityCurve = .linearFadeOut
        return p
    }

    func updateMissiles(dt: Float) {
        var arrived: [Missile] = []
        for i in missiles.indices {
            missiles[i].t += dt / missiles[i].duration
            let m = missiles[i]
            let t = min(m.t, 1)
            // Track a moving tank so the guided shot always lands.
            let target = m.tank.map { $0.position(relativeTo: nil) + [0, 3, 0] } ?? m.target
            let arc = sin(t * .pi) * min(60, simd_length(target - m.start) * 0.18)
            let position = m.start + (target - m.start) * t + SIMD3<Float>.up * arc
            let ahead = m.start + (target - m.start) * min(t + 0.02, 1) + SIMD3<Float>.up * sin(min(t + 0.02, 1) * .pi) * arc
            m.entity.look(at: ahead, from: position, relativeTo: nil)
            if m.t >= 1 { arrived.append(m) }
        }
        for m in arrived {
            missiles.removeAll { $0.entity === m.entity }
            m.entity.removeFromParent()
            if let tank = m.tank, tank.components[TankComponent.self]?.alive == true {
                destroyTank(tank)
            } else {
                missImpact(at: m.target)
                game.registerMiss()
            }
        }
    }
}
