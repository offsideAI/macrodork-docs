import RealityKit
import UIKit

/// Everything that rides with the player's head: the reticle and the HUD attachment.
enum PlayerRig {
    static let hudOffset: SIMD3<Float> = [0, -0.34, -1.35]
    static let reticleDistance: Float = 1.6

    static func makeHeadAnchor() -> AnchorEntity {
        let head = AnchorEntity(.head)
        head.name = "head"
        head.addChild(makeReticle())
        return head
    }

    /// Four thin bars and a centre dot, unlit, 1.6 m ahead. Small enough not to cover a distant tank.
    static func makeReticle() -> Entity {
        let reticle = Entity()
        reticle.name = "reticle"
        reticle.position = [0, 0, -reticleDistance]
        let mat = UnlitMaterial(color: UIColor(white: 1, alpha: 0.85))
        let gap: Float = 0.012, len: Float = 0.018, thick: Float = 0.0018
        let bars: [(SIMD3<Float>, SIMD3<Float>)] = [
            ([len, thick, thick], [-(gap + len / 2), 0, 0]),
            ([len, thick, thick], [gap + len / 2, 0, 0]),
            ([thick, len, thick], [0, gap + len / 2, 0]),
            ([thick, len, thick], [0, -(gap + len / 2), 0]),
        ]
        for (size, pos) in bars {
            let bar = ModelEntity(mesh: .generateBox(size: size), materials: [mat])
            bar.position = pos
            reticle.addChild(bar)
        }
        let dot = ModelEntity(mesh: .generateSphere(radius: 0.0015), materials: [mat])
        reticle.addChild(dot)
        return reticle
    }

    /// Where missiles leave from: just below and to the right of the eyes, like a shouldered launcher.
    static func muzzlePosition(head: Entity) -> SIMD3<Float> {
        let m = head.transformMatrix(relativeTo: nil)
        let origin = SIMD3<Float>(m.columns.3.x, m.columns.3.y, m.columns.3.z)
        let right = simd_normalize(SIMD3<Float>(m.columns.0.x, m.columns.0.y, m.columns.0.z))
        let forward = -simd_normalize(SIMD3<Float>(m.columns.2.x, m.columns.2.y, m.columns.2.z))
        return origin + forward * 0.7 + right * 0.32 - SIMD3<Float>.up * 0.28
    }

    static func headPosition(head: Entity) -> SIMD3<Float> {
        let m = head.transformMatrix(relativeTo: nil)
        return SIMD3<Float>(m.columns.3.x, m.columns.3.y, m.columns.3.z)
    }
}
