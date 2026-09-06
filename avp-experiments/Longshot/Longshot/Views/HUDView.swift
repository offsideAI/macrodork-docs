import SwiftUI

/// Head-anchored strip: four numbers while playing, an end card in debrief.
struct HUDView: View {
    @Environment(GameState.self) private var game

    var body: some View {
        Group {
            if game.phase == .debrief {
                endCard
            } else {
                strip
            }
        }
        .padding(.horizontal, 22)
        .padding(.vertical, 14)
        .glassBackgroundEffect()
    }

    private var strip: some View {
        HStack(spacing: 28) {
            stat("TIME", game.clock)
            stat("SCORE", "\(game.score)")
            stat("TANKS", "\(game.tanksDestroyed)")
            stat("STREAK", "\(game.streak)")
            Text(game.lastMessage)
                .font(.footnote)
                .foregroundStyle(.secondary)
                .lineLimit(1)
                .frame(minWidth: 220, alignment: .leading)
        }
        .font(.system(.title3, design: .rounded).monospacedDigit())
    }

    private var endCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(game.lastMessage.uppercased())
                .font(.system(.title2, design: .rounded).weight(.heavy))
                .tracking(1.5)
            HStack(spacing: 28) {
                stat("SCORE", "\(game.score)")
                stat("TANKS", "\(game.tanksDestroyed)")
                stat("ACCURACY", Scoring.accuracyText(hits: game.tanksDestroyed, shots: game.missilesFired))
                stat("BEST", "\(game.bestScore)")
            }
            .font(.system(.title3, design: .rounded).monospacedDigit())
            Text("Use the Longshot window to deploy again or exit.")
                .font(.footnote)
                .foregroundStyle(.secondary)
        }
    }

    private func stat(_ label: String, _ value: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label).font(.caption2.weight(.semibold)).tracking(1.2).foregroundStyle(.secondary)
            Text(value).fontWeight(.bold)
        }
    }
}
