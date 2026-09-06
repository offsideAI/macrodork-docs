import RealityKit
import UIKit

/// Sky dome, sun, horizon haze and a key light. All unlit except the light itself.
enum SkyBuilder {
    static func build() -> Entity {
        let root = Entity()
        root.name = "sky"

        // Dome: a large sphere with flipped winding so its inside is visible.
        let dome = ModelEntity(
            mesh: .generateSphere(radius: 1500),
            materials: [UnlitMaterial(color: UIColor(red: 0.62, green: 0.72, blue: 0.84, alpha: 1))]
        )
        dome.scale = [-1, 1, 1]
        root.addChild(dome)

        // Haze band: a flattened ring of pale colour sitting on the horizon.
        let haze = ModelEntity(
            mesh: .generateCylinder(height: 90, radius: 1300),
            materials: [UnlitMaterial(color: UIColor(red: 0.80, green: 0.84, blue: 0.88, alpha: 1))]
        )
        haze.scale = [-1, 1, 1]
        haze.position = [0, -20, 0]
        root.addChild(haze)

        // Sun disc, low and to the right so the voxel sides pick up shading.
        let sun = ModelEntity(
            mesh: .generateSphere(radius: 40),
            materials: [UnlitMaterial(color: UIColor(red: 1.0, green: 0.95, blue: 0.82, alpha: 1))]
        )
        sun.position = [600, 520, -1200]
        root.addChild(sun)

        let light = DirectionalLight()
        light.light.intensity = 3200
        light.light.color = UIColor(red: 1.0, green: 0.96, blue: 0.9, alpha: 1)
        light.look(at: .zero, from: sun.position, relativeTo: nil)
        root.addChild(light)

        return root
    }
}
