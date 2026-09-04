#!/usr/bin/env python3
"""Reconstruct hole features from STL meshes, used to rebuild the fastener list.

Idea: in a mesh exported from CAD, a hole is just a patch of cylindrical surface.
  1. Weld vertices and build the face adjacency graph
  2. Split at dihedral angles (break at sharp edges), region-grow "smooth patches"
  3. Fit a cylinder to each patch: all normals are perpendicular to the axis ->
     axis = eigenvector of the normal covariance with the smallest eigenvalue
  4. Project onto the plane perpendicular to the axis and fit a circle -> diameter
  5. Normals pointing toward the axis = hole; pointing away = shaft/boss

Usage:
    python scripts/analyze_holes.py <assets directory> [output json]
"""
import sys, os, struct, json, glob
import numpy as np
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components

SMOOTH_DEG   = 35.0     # dihedral-angle threshold: below this, faces belong to the same smooth patch
AXIS_TOL     = 0.25     # upper bound on |normal . axis|; larger means the patch is not cylindrical
FIT_TOL      = 0.03     # upper bound on the relative circle-fit residual
MIN_FACES    = 6        # a cylindrical patch must have at least this many triangles
MIN_DIA, MAX_DIA = 0.8, 14.0   # only holes in the fastener size range are of interest (mm)


def read_stl_mm(path):
    """Read a binary STL and return an (N,3,3) vertex array in mm."""
    b = open(path, 'rb').read()
    n = struct.unpack('<I', b[80:84])[0]
    a = np.frombuffer(b, dtype=np.uint8, count=n * 50, offset=84).reshape(n, 50)
    f = a[:, :48].copy().view('<f4').reshape(n, 12)
    return f[:, 3:12].reshape(n, 3, 3).astype(np.float64) * 1000.0


def weld(tris):
    """Merge duplicate vertices and return (vertex table, face indices)."""
    P = tris.reshape(-1, 3)
    key = np.round(P, 4)
    _, idx, inv = np.unique(key, axis=0, return_index=True, return_inverse=True)
    return P[idx], inv.reshape(-1, 3)


def face_normals(V, F):
    n = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]])
    L = np.linalg.norm(n, axis=1, keepdims=True)
    return n / np.where(L < 1e-12, 1, L)


def smooth_patches(V, F, N):
    """Split at dihedral angles and cluster faces into smooth patches."""
    nf = len(F)
    e = np.concatenate([F[:, [0, 1]], F[:, [1, 2]], F[:, [2, 0]]])
    e = np.sort(e, axis=1)
    fid = np.tile(np.arange(nf), 3)
    order = np.lexsort((e[:, 1], e[:, 0]))
    e, fid = e[order], fid[order]
    same = np.all(e[1:] == e[:-1], axis=1)          # two adjacent records are the same edge
    f1, f2 = fid[:-1][same], fid[1:][same]
    if len(f1) == 0:
        return np.zeros(nf, int), 1
    keep = np.einsum('ij,ij->i', N[f1], N[f2]) > np.cos(np.radians(SMOOTH_DEG))
    f1, f2 = f1[keep], f2[keep]
    g = coo_matrix((np.ones(len(f1)), (f1, f2)), shape=(nf, nf))
    return connected_components(g, directed=False)[1], connected_components(g, directed=False)[0]


def fit_circle(xy):
    """Kasa algebraic circle fit; returns (center, radius, relative residual)."""
    x, y = xy[:, 0], xy[:, 1]
    A = np.c_[x, y, np.ones(len(x))]
    b = x ** 2 + y ** 2
    try:
        s, *_ = np.linalg.lstsq(A, b, rcond=None)
    except np.linalg.LinAlgError:
        return None, None, 9e9
    cx, cy = s[0] / 2, s[1] / 2
    r2 = s[2] + cx ** 2 + cy ** 2
    if r2 <= 0:
        return None, None, 9e9
    r = np.sqrt(r2)
    resid = np.abs(np.hypot(x - cx, y - cy) - r).mean()
    return np.array([cx, cy]), r, resid / max(r, 1e-9)


def analyze(path):
    tris = read_stl_mm(path)
    V, F = weld(tris)
    N = face_normals(V, F)
    lab, k = smooth_patches(V, F, N)
    holes = []
    for p in range(k):
        sel = np.where(lab == p)[0]
        if len(sel) < MIN_FACES:
            continue
        n = N[sel]
        # All normals of a cylindrical patch are perpendicular to the axis ->
        # the axis is the smallest-eigenvalue eigenvector of the normal covariance matrix
        w, vec = np.linalg.eigh(n.T @ n)
        axis = vec[:, 0]
        if np.abs(n @ axis).max() > AXIS_TOL:
            continue
        pts = V[F[sel]].reshape(-1, 3)
        e1 = np.cross(axis, [1, 0, 0])
        if np.linalg.norm(e1) < 1e-6:
            e1 = np.cross(axis, [0, 1, 0])
        e1 /= np.linalg.norm(e1)
        e2 = np.cross(axis, e1)
        xy = np.c_[pts @ e1, pts @ e2]
        c, r, res = fit_circle(xy)
        if r is None or res > FIT_TOL:
            continue
        dia = 2 * r
        if not (MIN_DIA <= dia <= MAX_DIA):
            continue
        # Concave vs convex: normals pointing toward the axis = hole
        cen3 = c[0] * e1 + c[1] * e2
        fc = V[F[sel]].mean(1)
        radial = fc - (cen3 + np.outer(fc @ axis, axis))
        radial /= np.maximum(np.linalg.norm(radial, axis=1, keepdims=True), 1e-9)
        inward = (np.einsum('ij,ij->i', n, radial) < 0).mean()
        if inward < 0.7:
            continue                                  # convex patches are shafts/bosses, not holes
        ang = np.arctan2(xy[:, 1] - c[1], xy[:, 0] - c[0])
        cover = np.degrees(np.ptp(np.sort(ang)))
        depth = float(np.ptp(pts @ axis))
        holes.append({'diameter_mm': round(float(dia), 3),
                      'depth_mm': round(depth, 2),
                      'wrap_angle_deg': round(float(cover)),
                      'faces': int(len(sel))})
    return holes


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else "upstream/microduck_rl/src/mjlab_microduck/robot/microduck/assets"
    out = sys.argv[2] if len(sys.argv) > 2 else "docs/hole_analysis.json"
    files = sorted(glob.glob(os.path.join(src, "*.stl")))
    if not files:
        sys.exit("No STL files found in: " + src)
    result = {}
    for f in files:
        name = os.path.basename(f)
        try:
            h = analyze(f)
        except Exception as ex:
            print(f"  !! {name}: {type(ex).__name__} {ex}")
            continue
        result[name] = h
        if h:
            print(f"  {name:42s} {len(h):3d} holes")
    os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
    json.dump(result, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print("\nWrote", out)


if __name__ == '__main__':
    main()
