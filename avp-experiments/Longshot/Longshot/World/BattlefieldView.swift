import RealityKit
import SwiftUI

/// The immersive scene. Thin: builds the Battlefield once and forwards taps to it.
struct BattlefieldView: View {
    @Environment(GameState.self) private var game
    @State private var field: Battlefield?

    var body: some View {
        RealityView { content, attachments in
            let f = Battlefield(game: game)
            f.build(into: content, attachments: attachments)
            field = f
        } attachments: {
            Attachment(id: "hud") {
                HUDView()
                    .environment(game)
            }
        }
        .gesture(
            SpatialTapGesture()
                .targetedToAnyEntity()
                .onEnded { value in
                    let point = value.convert(value.location3D, from: .local, to: .scene)
                    field?.handleTap(entity: value.entity, at: point)
                }
        )
    }
}
