#!/usr/bin/env python3
"""Export assembled STL files from the upstream MJCF.

The 47 STL files in the upstream repository are each in their own part frame;
importing them straight into CAD piles everything up at the origin.
This script reads the MJCF kinematic tree, transforms every mesh by its world
transform, then exports one STL per rigid body, giving an assembly that opens
directly in CAD / slicer software.

Usage:
    python scripts/export_assembly_stl.py <upstream microduck_rl path> [output directory]
"""
import sys, os, struct, json
import numpy as np
import mujoco

MJCF = "src/mjlab_microduck/robot/microduck/robot_allcollisions.xml"

NAMES = {
    'trunk_base':'01_trunk_body','yaw2roll':'02_left_hip_yaw-roll','hip_l':'03_left_hip_roll',
    'upper_leg_left':'04_left_upper_leg','leg':'05_left_lower_leg','ankle_left':'06_left_ankle_foot',
    'neck':'07_neck_base','neck_pitch':'08_neck_pitch','yaw_roll_motion':'09_head_yaw-roll',
    'jaw_soft':'10_head_assembly','bearing_roll':'11_right_hip_yaw-roll','hip_l_2':'12_right_hip_roll',
    'upper_leg_right':'13_right_upper_leg','leg_2':'14_right_lower_leg','ankle_right':'15_right_ankle_foot',
    # Upstream renamed a few bodies between revisions; map both spellings.
    'left_upper_leg':'04_left_upper_leg','right_upper_leg':'13_right_upper_leg',
    'bottom_head_shell':'10_head_assembly',
}


def write_stl(path, tris):
    """Write a binary STL. tris: (N,3,3) vertex array in mm."""
    with open(path, 'wb') as f:
        f.write(b'\0' * 80)
        f.write(struct.pack('<I', len(tris)))
        for t in tris:
            n = np.cross(t[1] - t[0], t[2] - t[0])
            L = np.linalg.norm(n)
            n = n / L if L > 1e-12 else np.zeros(3)
            f.write(struct.pack('<3f', *n))
            for v in t:
                f.write(struct.pack('<3f', *v))
            f.write(b'\0\0')


def geom_tris(m, d, g):
    """Take the triangles of a single geom, transform to world frame, convert to mm."""
    mid = m.geom_dataid[g]
    if mid < 0:
        return None
    va, vn = m.mesh_vertadr[mid], m.mesh_vertnum[mid]
    fa, fn = m.mesh_faceadr[mid], m.mesh_facenum[mid]
    V = m.mesh_vert[va:va + vn].reshape(-1, 3)
    F = m.mesh_face[fa:fa + fn].reshape(-1, 3)
    R = d.geom_xmat[g].reshape(3, 3)
    W = (V @ R.T) + d.geom_xpos[g]
    return W[F] * 1000.0


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    root = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else "cad"
    os.makedirs(out, exist_ok=True)

    path = os.path.join(root, MJCF)
    if not os.path.exists(path):
        sys.exit(f"MJCF not found: {path}\nRun scripts/fetch_upstream.sh first")

    m = mujoco.MjModel.from_xml_path(path)
    d = mujoco.MjData(m)
    d.qpos[:] = 0
    d.qpos[3] = 1.0          # unit quaternion for the free joint - zero-position reference pose
    mujoco.mj_forward(m, d)

    names = [mujoco.mj_id2name(m, mujoco.mjtObj.mjOBJ_BODY, i) for i in range(m.nbody)]
    allt, manifest = [], {}

    for b in range(1, m.nbody):
        tris, srcs = [], []
        for g in range(m.ngeom):
            if m.geom_bodyid[g] != b or m.geom_group[g] != 2:   # group 2 = visual meshes
                continue
            t = geom_tris(m, d, g)
            if t is None:
                continue
            tris.append(t)
            srcs.append(mujoco.mj_id2name(m, mujoco.mjtObj.mjOBJ_MESH, m.geom_dataid[g]))
        if not tris:
            continue
        T = np.concatenate(tris, 0)
        allt.append(T)
        name = NAMES.get(names[b], names[b])
        write_stl(os.path.join(out, f"{name}.stl"), T)
        manifest[name] = {'body': names[b], 'source_stl': srcs, 'triangles': len(T)}
        print(f"  {name:22s} {len(T):7d} tris  <- {len(srcs)} source meshes")

    A = np.concatenate(allt, 0)
    write_stl(os.path.join(out, "00_macrodork_full_assembly.stl"), A)
    bb = A.reshape(-1, 3)
    print(f"\nFull assembly: {len(A)} triangles")
    print(f"Size (mm): {bb[:,0].ptp():.1f} x {bb[:,1].ptp():.1f} x {bb[:,2].ptp():.1f}")

    with open(os.path.join(out, "parts_manifest.json"), 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)


if __name__ == '__main__':
    main()
