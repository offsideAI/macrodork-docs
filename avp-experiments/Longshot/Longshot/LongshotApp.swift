import SwiftUI

@main
struct LongshotApp: App {
    @State private var game = GameState()
    @State private var immersion: ImmersionStyle = .full

    var body: some Scene {
        WindowGroup(id: "menu") {
            MenuView()
                .environment(game)
        }
        .defaultSize(width: 560, height: 460)

        ImmersiveSpace(id: "battlefield") {
            BattlefieldView()
                .environment(game)
        }
        .immersionStyle(selection: $immersion, in: .full)
    }
}
