import Foundation
import Observation

/// Shared game state. Mutated only on the main actor: from SwiftUI actions and from the
/// RealityKit update loop, both of which run there.
@Observable
@MainActor
final class GameState {
    enum Phase { case menu, playing, debrief }

    // Tuning
    let roundLength: TimeInterval = 120
    let fireCooldown: TimeInterval = 0.8
    let maxMissilesInFlight = 2
    let minTanks = 3
    let maxTanks = 5

    // Round
    var phase: Phase = .menu
    var timeRemaining: TimeInterval = 120
    var score = 0
    var streak = 0
    var bestStreak = 0
    var tanksDestroyed = 0
    var missilesFired = 0
    var lastMessage = ""

    // Persistent
    var bestScore: Int = UserDefaults.standard.integer(forKey: "bestScore")

    var accuracy: Double {
        missilesFired == 0 ? 0 : Double(tanksDestroyed) / Double(missilesFired)
    }

    var clock: String {
        let t = max(0, Int(timeRemaining.rounded(.up)))
        return String(format: "%d:%02d", t / 60, t % 60)
    }

    func startRound() {
        timeRemaining = roundLength
        score = 0
        streak = 0
        bestStreak = 0
        tanksDestroyed = 0
        missilesFired = 0
        lastMessage = "Tanks in the valley. Look at one and pinch."
        phase = .playing
    }

    func tick(_ dt: TimeInterval) {
        guard phase == .playing else { return }
        timeRemaining -= dt
        if timeRemaining <= 0 {
            timeRemaining = 0
            endRound()
        }
    }

    func registerFire() { missilesFired += 1 }

    func registerHit() {
        tanksDestroyed += 1
        streak += 1
        bestStreak = max(bestStreak, streak)
        let gained = Scoring.hitPoints(streak: streak)
        score += gained
        lastMessage = streak > 1 ? "Hit. Streak \(streak), +\(gained)" : "Hit. +\(gained)"
    }

    func registerMiss() {
        streak = 0
        score = Scoring.afterMiss(score)
        lastMessage = "Miss."
    }

    func endRound() {
        phase = .debrief
        if score > bestScore {
            bestScore = score
            UserDefaults.standard.set(bestScore, forKey: "bestScore")
            lastMessage = "New best score."
        } else {
            lastMessage = "Round over."
        }
    }

    func backToMenu() { phase = .menu }
}
