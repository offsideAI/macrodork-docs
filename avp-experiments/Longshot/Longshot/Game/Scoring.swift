import Foundation

/// Pure scoring rules from BRD F11. Kept free of state so they can be unit-tested.
enum Scoring {
    static let tankValue = 100
    static let streakStep = 25
    static let streakCap = 200
    static let missPenalty = 10

    /// Points for a hit given the streak length after this hit (1 for the first hit).
    static func hitPoints(streak: Int) -> Int {
        let bonus = min(streakCap, max(0, streak - 1) * streakStep)
        return tankValue + bonus
    }

    static func afterMiss(_ score: Int) -> Int {
        max(0, score - missPenalty)
    }

    static func accuracyText(hits: Int, shots: Int) -> String {
        guard shots > 0 else { return "0%" }
        return "\(Int((Double(hits) / Double(shots) * 100).rounded()))%"
    }
}
