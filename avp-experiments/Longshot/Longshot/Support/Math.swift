import Foundation
import simd

/// Deterministic generator so the battlefield is the same on every launch for a given seed.
struct SeededRNG: RandomNumberGenerator {
    private var state: UInt64

    init(seed: UInt64) { state = seed &+ 0x9E37_79B9_7F4A_7C15 }

    mutating func next() -> UInt64 {
        state ^= state >> 12
        state ^= state << 25
        state ^= state >> 27
        return state &* 2_685_821_657_736_338_717
    }

    mutating func nextFloat() -> Float { Float(next() >> 40) / Float(1 << 24) }

    mutating func range(_ r: ClosedRange<Float>) -> Float {
        r.lowerBound + (r.upperBound - r.lowerBound) * nextFloat()
    }
}

@inline(__always) func lerp(_ a: Float, _ b: Float, _ t: Float) -> Float { a + (b - a) * t }
@inline(__always) func smoothstep(_ t: Float) -> Float { t * t * (3 - 2 * t) }
@inline(__always) func clamp<T: Comparable>(_ v: T, _ lo: T, _ hi: T) -> T { min(max(v, lo), hi) }

extension SIMD3 where Scalar == Float {
    var xz: SIMD2<Float> { SIMD2(x, z) }
    func withY(_ y: Float) -> SIMD3<Float> { SIMD3(x, y, z) }
    static let up = SIMD3<Float>(0, 1, 0)
}

func horizontalDistance(_ a: SIMD3<Float>, _ b: SIMD3<Float>) -> Float {
    simd_length(a.xz - b.xz)
}

/// Yaw rotation about +Y so that the entity's +X axis points along `heading` (radians, 0 = +X).
func yawRotation(_ heading: Float) -> simd_quatf {
    simd_quatf(angle: -heading, axis: .up)
}
