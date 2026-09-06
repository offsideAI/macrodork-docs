import Foundation
import simd

/// Seeded value-noise terrain. World frame: player at the origin, forward is -Z, up is +Y.
/// The player's own column is at y = 0 so the real floor and the ridge top coincide.
struct Heightmap {
    let size: Float = 640      // metres, square, centred on the player
    let voxel: Float = 4       // horizontal cell size
    let step: Float = 2        // vertical quantisation
    let seed: UInt64

    private let base: Float

    init(seed: UInt64) {
        self.seed = seed
        base = Heightmap.shaped(x: 0, z: 0, seed: seed)
    }

    /// Quantised height at world x, z.
    func height(x: Float, z: Float) -> Float {
        let raw = Heightmap.shaped(x: x, z: z, seed: seed) - base
        return (raw / step).rounded(.down) * step
    }

    /// Height by column index; columns run from -size/2 to +size/2.
    func columnHeight(_ i: Int, _ j: Int) -> Float {
        height(x: columnX(i), z: columnZ(j))
    }

    var columns: Int { Int(size / voxel) }
    func columnX(_ i: Int) -> Float { (Float(i) + 0.5) * voxel - size / 2 }
    func columnZ(_ j: Int) -> Float { (Float(j) + 0.5) * voxel - size / 2 }

    // MARK: - Shaping

    private static func shaped(x: Float, z: Float, seed: UInt64) -> Float {
        let broad = fbm(x / 90 + 13.7, z / 90 + 4.2, seed: seed)
        let detail = fbm(x / 22, z / 22, seed: seed &+ 77) - 0.5
        var h = broad * 28 + detail * 6

        let ahead = -z
        let valley = exp(-pow((ahead - 190) / 110, 2))          // bowl centred 190 m ahead
        h -= valley * 26
        let far = smoothstep(clamp((ahead - 330) / 120, 0, 1)) // hills on the far side
        h += far * 40
        let r = simd_length(SIMD2(x, z))
        let ridge = 1 - smoothstep(clamp((r - 22) / 24, 0, 1)) // plateau under the player
        h = lerp(h, 30, ridge)
        return h
    }

    private static func fbm(_ x: Float, _ z: Float, seed: UInt64) -> Float {
        var amp: Float = 0.5, freq: Float = 1, sum: Float = 0, norm: Float = 0
        for _ in 0..<4 {
            sum += amp * valueNoise(x * freq, z * freq, seed: seed)
            norm += amp
            amp *= 0.5
            freq *= 2.1
        }
        return sum / norm
    }

    private static func valueNoise(_ x: Float, _ z: Float, seed: UInt64) -> Float {
        let x0 = Int(floor(x)), z0 = Int(floor(z))
        let tx = smoothstep(x - Float(x0)), tz = smoothstep(z - Float(z0))
        let a = hash(x0, z0, seed), b = hash(x0 + 1, z0, seed)
        let c = hash(x0, z0 + 1, seed), d = hash(x0 + 1, z0 + 1, seed)
        return lerp(lerp(a, b, tx), lerp(c, d, tx), tz)
    }

    private static func hash(_ x: Int, _ z: Int, _ seed: UInt64) -> Float {
        var h = UInt64(bitPattern: Int64(x)) &* 0x9E37_79B9_7F4A_7C15
        h ^= UInt64(bitPattern: Int64(z)) &* 0xC2B2_AE3D_27D4_EB4F
        h ^= seed
        h ^= h >> 31; h &*= 0x7FB5_D329_728E_A185
        h ^= h >> 27; h &*= 0x81DA_DEF4_BC2D_D44D
        h ^= h >> 33
        return Float(h >> 40) / Float(1 << 24)
    }
}
