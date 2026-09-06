import RealityKit
import UIKit

/// Turns a Heightmap into chunked voxel meshes. Only exposed faces are emitted: every column's
/// top, and a side quad wherever a neighbour is lower. Per-face material indices give the
/// altitude bands their colours.
enum TerrainBuilder {
    static let chunks = 4

    enum Band: UInt32, CaseIterable {
        case valleyFloor = 0, grass, scorched, rock, snow, side

        var material: SimpleMaterial {
            switch self {
            case .valleyFloor: return SimpleMaterial(color: UIColor(red: 0.30, green: 0.36, blue: 0.20, alpha: 1), roughness: 1, isMetallic: false)
            case .grass:       return SimpleMaterial(color: UIColor(red: 0.42, green: 0.52, blue: 0.24, alpha: 1), roughness: 1, isMetallic: false)
            case .scorched:    return SimpleMaterial(color: UIColor(red: 0.47, green: 0.40, blue: 0.28, alpha: 1), roughness: 1, isMetallic: false)
            case .rock:        return SimpleMaterial(color: UIColor(red: 0.50, green: 0.50, blue: 0.48, alpha: 1), roughness: 1, isMetallic: false)
            case .snow:        return SimpleMaterial(color: UIColor(red: 0.90, green: 0.92, blue: 0.94, alpha: 1), roughness: 1, isMetallic: false)
            case .side:        return SimpleMaterial(color: UIColor(red: 0.36, green: 0.30, blue: 0.22, alpha: 1), roughness: 1, isMetallic: false)
            }
        }

        static func forTop(height y: Float) -> Band {
            switch y {
            case ..<(-30): return .valleyFloor
            case ..<(-8):  return .grass
            case ..<6:     return .scorched
            case ..<16:    return .rock
            default:       return .snow
            }
        }
    }

    /// Builds all chunk entities. Returns the entities and the total triangle count.
    static func build(_ map: Heightmap) throws -> (entities: [ModelEntity], triangles: Int) {
        let n = map.columns
        var heights = [[Float]](repeating: [Float](repeating: 0, count: n), count: n)
        for i in 0..<n { for j in 0..<n { heights[i][j] = map.columnHeight(i, j) } }

        let materials = Band.allCases.map { $0.material }
        let per = n / chunks
        var entities: [ModelEntity] = []
        var triangles = 0

        for ci in 0..<chunks {
            for cj in 0..<chunks {
                var mesh = QuadMesh()
                for i in (ci * per)..<((ci + 1) * per) {
                    for j in (cj * per)..<((cj + 1) * per) {
                        emitColumn(i, j, heights: heights, map: map, into: &mesh)
                    }
                }
                let resource = try MeshResource.generate(from: [mesh.descriptor(name: "terrain-\(ci)-\(cj)")])
                let entity = ModelEntity(mesh: resource, materials: materials)
                entity.name = "terrain"
                entities.append(entity)
                triangles += mesh.triangleCount
            }
        }
        return (entities, triangles)
    }

    private static func emitColumn(_ i: Int, _ j: Int, heights: [[Float]], map: Heightmap, into mesh: inout QuadMesh) {
        let n = heights.count
        let h = heights[i][j]
        let x0 = map.columnX(i) - map.voxel / 2, x1 = x0 + map.voxel
        let z0 = map.columnZ(j) - map.voxel / 2, z1 = z0 + map.voxel
        let top = Band.forTop(height: h).rawValue

        // Top face, normal +Y, counter-clockwise seen from above.
        mesh.addQuad([x0, h, z1], [x1, h, z1], [x1, h, z0], [x0, h, z0], normal: [0, 1, 0], material: top)

        // Sides: one quad from the lower neighbour's height up to ours.
        let side = Band.side.rawValue
        let west = i > 0 ? heights[i - 1][j] : h - 60
        if west < h { mesh.addQuad([x0, west, z0], [x0, west, z1], [x0, h, z1], [x0, h, z0], normal: [-1, 0, 0], material: side) }
        let east = i < n - 1 ? heights[i + 1][j] : h - 60
        if east < h { mesh.addQuad([x1, east, z1], [x1, east, z0], [x1, h, z0], [x1, h, z1], normal: [1, 0, 0], material: side) }
        let north = j > 0 ? heights[i][j - 1] : h - 60
        if north < h { mesh.addQuad([x1, north, z0], [x0, north, z0], [x0, h, z0], [x1, h, z0], normal: [0, 0, -1], material: side) }
        let south = j < n - 1 ? heights[i][j + 1] : h - 60
        if south < h { mesh.addQuad([x0, south, z1], [x1, south, z1], [x1, h, z1], [x0, h, z1], normal: [0, 0, 1], material: side) }
    }
}

/// Accumulates quads into buffers ready for a MeshDescriptor.
struct QuadMesh {
    private(set) var positions: [SIMD3<Float>] = []
    private(set) var normals: [SIMD3<Float>] = []
    private(set) var indices: [UInt32] = []
    private(set) var faceMaterials: [UInt32] = []

    var triangleCount: Int { indices.count / 3 }

    mutating func addQuad(_ a: SIMD3<Float>, _ b: SIMD3<Float>, _ c: SIMD3<Float>, _ d: SIMD3<Float>, normal: SIMD3<Float>, material: UInt32) {
        let base = UInt32(positions.count)
        positions.append(contentsOf: [a, b, c, d])
        normals.append(contentsOf: [normal, normal, normal, normal])
        indices.append(contentsOf: [base, base + 1, base + 2, base, base + 2, base + 3])
        faceMaterials.append(contentsOf: [material, material])
    }

    func descriptor(name: String) -> MeshDescriptor {
        var d = MeshDescriptor(name: name)
        d.positions = MeshBuffers.Positions(positions)
        d.normals = MeshBuffers.Normals(normals)
        d.primitives = .triangles(indices)
        d.materials = .perFace(faceMaterials)
        return d
    }
}
