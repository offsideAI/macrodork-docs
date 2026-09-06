import Foundation
import RealityKit

/// Synthesises the two sounds the game needs at launch and plays them spatially.
/// No audio assets are shipped; both clips are written to the temporary directory as WAV.
@MainActor
final class SynthAudio {
    private var explosion: AudioFileResource?
    private var launch: AudioFileResource?

    init() {
        explosion = SynthAudio.load(name: "boom", samples: SynthAudio.explosionSamples())
        launch = SynthAudio.load(name: "whoosh", samples: SynthAudio.launchSamples())
    }

    func playExplosion(at position: SIMD3<Float>, parent: Entity, gain: Double = 0) {
        guard let explosion else { return }
        let e = Entity()
        e.position = position
        e.components.set(SpatialAudioComponent(gain: gain))
        parent.addChild(e)
        e.playAudio(explosion)
        Task { @MainActor in
            try? await Task.sleep(for: .seconds(3))
            e.removeFromParent()
        }
    }

    func playLaunch(from entity: Entity) {
        guard let launch else { return }
        entity.components.set(SpatialAudioComponent(gain: -6))
        entity.playAudio(launch)
    }

    // MARK: - Synthesis

    private static let rate = 22_050

    private static func explosionSamples() -> [Float] {
        let n = Int(Double(rate) * 1.6)
        var out = [Float](repeating: 0, count: n)
        var rng = SeededRNG(seed: 99)
        var lowpass: Float = 0
        for i in 0..<n {
            let t = Float(i) / Float(rate)
            let noise = rng.range(-1...1)
            lowpass += (noise - lowpass) * 0.12                  // muffle the noise
            let crack = expf(-t * 9) * noise * 0.6                // initial sharp crack
            let rumble = expf(-t * 2.2) * lowpass * 1.4           // body
            let thump = expf(-t * 4) * sinf(2 * .pi * 48 * t) * 0.9
            out[i] = tanhf(crack + rumble + thump)
        }
        return out
    }

    private static func launchSamples() -> [Float] {
        let n = Int(Double(rate) * 0.5)
        var out = [Float](repeating: 0, count: n)
        var rng = SeededRNG(seed: 5)
        var lowpass: Float = 0
        for i in 0..<n {
            let t = Float(i) / Float(rate)
            let env = sinf(.pi * t / 0.5)
            lowpass += (rng.range(-1...1) - lowpass) * 0.3
            out[i] = lowpass * env * 0.7
        }
        return out
    }

    private static func load(name: String, samples: [Float]) -> AudioFileResource? {
        let url = FileManager.default.temporaryDirectory.appendingPathComponent("longshot-\(name).wav")
        do {
            try wavData(samples).write(to: url)
            return try AudioFileResource.load(contentsOf: url, withName: name)
        } catch {
            print("Longshot audio failed for \(name): \(error)")
            return nil
        }
    }

    /// 16-bit mono PCM WAV.
    private static func wavData(_ samples: [Float]) -> Data {
        var pcm = Data(capacity: samples.count * 2)
        for s in samples {
            var v = Int16(clamp(s, -1, 1) * 32_767)
            pcm.append(Data(bytes: &v, count: 2))
        }
        var d = Data()
        func u32(_ v: UInt32) { var x = v.littleEndian; d.append(Data(bytes: &x, count: 4)) }
        func u16(_ v: UInt16) { var x = v.littleEndian; d.append(Data(bytes: &x, count: 2)) }
        d.append("RIFF".data(using: .ascii)!); u32(UInt32(36 + pcm.count)); d.append("WAVE".data(using: .ascii)!)
        d.append("fmt ".data(using: .ascii)!); u32(16); u16(1); u16(1); u32(UInt32(rate)); u32(UInt32(rate * 2)); u16(2); u16(16)
        d.append("data".data(using: .ascii)!); u32(UInt32(pcm.count)); d.append(pcm)
        return d
    }
}
