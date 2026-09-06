import RealityKit
import UIKit

/// Per-tank simulation state carried on the entity.
struct TankComponent: Component {
    var heading: Float          // radians, 0 = +X
    var speed: Float            // m/s
    var zoneCenter: SIMD3<Float>
    var zoneRadius: Float
    var alive = true
}

/// Builds a boxy, readable-at-distance tank from primitives. Root carries the gameplay components;
/// the visible parts are children so they can be flung apart on destruction.
enum TankFactory {
    static let olive = SimpleMaterial(color: UIColor(red: 0.30, green: 0.34, blue: 0.22, alpha: 1), roughness: 0.9, isMetallic: false)
    static let turretGreen = SimpleMaterial(color: UIColor(red: 0.40, green: 0.45, blue: 0.30, alpha: 1), roughness: 0.9, isMetallic: false)
    static let steel = SimpleMaterial(color: UIColor(red: 0.16, green: 0.17, blue: 0.16, alpha: 1), roughness: 0.6, isMetallic: true)

    static func make(id: Int, tank: TankComponent) -> Entity {
        let root = Entity()
        root.name = "tank-\(id)"

        let hull = part(.generateBox(size: [9.0, 2.6, 5.2], cornerRadius: 0.25), olive, at: [0, 1.9, 0], name: "hull")
        let trackL = part(.generateBox(size: [9.8, 1.7, 1.5], cornerRadius: 0.5), steel, at: [0, 0.85, -2.9], name: "trackL")
        let trackR = part(.generateBox(size: [9.8, 1.7, 1.5], cornerRadius: 0.5), steel, at: [0, 0.85, 2.9], name: "trackR")
        let turret = part(.generateBox(size: [4.4, 1.9, 3.6], cornerRadius: 0.4), turretGreen, at: [-0.6, 4.1, 0], name: "turret")
        let barrel = part(.generateBox(size: [6.4, 0.7, 0.7], cornerRadius: 0.2), steel, at: [4.6, 4.4, 0], name: "barrel")
        for part in [hull, trackL, trackR, turret, barrel] { root.addChild(part) }

        // Oversized collider so a gaze at distance selects it reliably.
        let shape = ShapeResource.generateBox(size: [16, 11, 13]).offsetBy(translation: [0, 4.5, 0])
        root.components.set(CollisionComponent(shapes: [shape]))
        root.components.set(InputTargetComponent())
        root.components.set(HoverEffectComponent())
        root.components.set(tank)
        return root
    }

    private static func part(_ mesh: MeshResource, _ material: SimpleMaterial, at position: SIMD3<Float>, name: String) -> ModelEntity {
        let e = ModelEntity(mesh: mesh, materials: [material])
        e.position = position
        e.name = name
        return e
    }
}
