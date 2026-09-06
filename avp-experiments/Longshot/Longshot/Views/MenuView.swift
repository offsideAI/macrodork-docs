import SwiftUI

struct MenuView: View {
    @Environment(GameState.self) private var game
    @Environment(\.openImmersiveSpace) private var openImmersiveSpace
    @Environment(\.dismissImmersiveSpace) private var dismissImmersiveSpace
    @State private var deployed = false
    @State private var busy = false

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            VStack(alignment: .leading, spacing: 6) {
                Text("LONGSHOT")
                    .font(.system(size: 34, weight: .heavy, design: .rounded))
                    .tracking(2)
                Text("Sniper overwatch, voxel valley, two minutes.")
                    .foregroundStyle(.secondary)
            }

            if game.phase == .debrief {
                debrief
            } else {
                Text("You are on the ridge. Tanks patrol the valley below. Look at one, pinch to release a missile, watch it go. Misses cost points. Streaks earn them.")
                    .font(.callout)
                    .foregroundStyle(.secondary)
            }

            Spacer(minLength: 0)

            HStack {
                Label("Best \(game.bestScore)", systemImage: "trophy")
                    .font(.footnote.monospacedDigit())
                    .foregroundStyle(.secondary)
                Spacer()
                if deployed {
                    Button("Exit", role: .cancel) { Task { await exit() } }
                        .disabled(busy)
                }
                Button(game.phase == .debrief ? "Deploy again" : "Deploy") { Task { await deploy() } }
                    .buttonStyle(.borderedProminent)
                    .disabled(busy)
            }
        }
        .padding(28)
        .frame(minWidth: 480, minHeight: 380)
    }

    private var debrief: some View {
        Grid(alignment: .leading, horizontalSpacing: 24, verticalSpacing: 8) {
            GridRow { Text("Score"); Text("\(game.score)").bold() }
            GridRow { Text("Tanks destroyed"); Text("\(game.tanksDestroyed)") }
            GridRow { Text("Missiles fired"); Text("\(game.missilesFired)") }
            GridRow { Text("Accuracy"); Text(Scoring.accuracyText(hits: game.tanksDestroyed, shots: game.missilesFired)) }
            GridRow { Text("Best streak"); Text("\(game.bestStreak)") }
        }
        .font(.body.monospacedDigit())
    }

    private func deploy() async {
        busy = true
        defer { busy = false }
        game.startRound()
        if !deployed {
            switch await openImmersiveSpace(id: "battlefield") {
            case .opened: deployed = true
            default: game.backToMenu()
            }
        }
    }

    private func exit() async {
        busy = true
        defer { busy = false }
        await dismissImmersiveSpace()
        deployed = false
        game.backToMenu()
    }
}
