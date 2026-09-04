#!/usr/bin/env python3
"""Build the print/ tree (individual printable STLs) from the upstream mesh release.

The upstream STLs are not stored in this repository. This script reads them from a
local upstream checkout at a pinned commit, renames them to the Macrodork part names
and sorts them into print/printed-parts, print/standard-parts-not-printed,
print/variant-roller-skate and print/removed-upstream.

Usage:
    python scripts/build_print_tree.py [--upstream upstream/microduck_rl] [--out print]
                                       [--ref d424a0c] [--table]

    --table   print the part-name mapping as a Markdown table and exit

The pinned commit is the upstream baseline every count in this repository was taken
from (see NOTICE.md). If the object is not in the local clone, the script fetches
that single commit from origin.
"""
import argparse
import os
import struct
import subprocess
import sys

UPSTREAM_REF = "d424a0c"  # 2026-08-27, the baseline for every mesh count in the docs
ASSETS = "src/mjlab_microduck/robot/microduck/assets"

# (macrodork name, upstream mesh name, quantity, note)
PRINTED = [
    ("trunk_base",                "trunk_base",               1, "Trunk core; the hip servos and the neck bolt to it"),
    ("trunk_shell_left",          "left_shell",               1, "Trunk side shell, left"),
    ("trunk_shell_right",         "right_shell",              1, "Trunk side shell, right"),
    ("battery_support",           "power_support",            2, "Holds the NP-F battery; no contact model, see BOM"),
    ("imu_board_retainer",        "banana_pcb_locker",        1, "Clip that holds the imu_to_dxl board"),
    ("hip_yaw_roll_bracket",      "yaw2roll",                 2, "Links the hip-yaw servo to the hip-roll axis"),
    ("hip_roll_bearing_cap",      "bearing_roll",             2, "Retaining cap for the 22 mm hip-roll bearing (not a bearing)"),
    ("hip_roll_link",             "hip_l",                    2, "Hip-roll body between bracket and upper leg"),
    ("upper_leg_left",            "upper_leg_left",           1, "Thigh, left"),
    ("upper_leg_right",           "upper_leg_right",          1, "Thigh, right (upstream also ships a duplicate export, dropped)"),
    ("upper_leg_rigidity_plate",  "upper_leg_rigidity_plate", 2, "Stiffening plate on each thigh"),
    ("lower_leg",                 "leg",                      4, "Shin plate, two per leg"),
    ("ankle_left",                "ankle_left",               1, ""),
    ("ankle_right",               "ankle_right",              1, ""),
    ("foot_left",                 "foot_left",                1, ""),
    ("foot_right",                "foot_right",               1, ""),
    ("sole_left",                 "sole_left",                2, ""),
    ("sole_right",                "sole_right",               2, ""),
    ("neck_base",                 "neck",                     2, "Neck base halves, around the neck servo"),
    ("neck_pitch",                "neck_pitch",               1, ""),
    ("head_yaw_roll_link",        "yaw_roll_motion",          1, "Head yaw/roll mechanism body"),
    ("head_shell_top",            "top_head_shell",           1, "Cosmetic"),
    ("head_shell_bottom",         "bottom_head_shell",        1, "Cosmetic"),
    ("face_plate",                "face_part",                1, "Front face with camera and ToF openings"),
    ("head_servo_mount",          "motor_support",            1, "Mount for the jaw servo inside the head"),
    ("noenoeil",                  "noenoeil",                 1, "Small part at the jaw-servo mount; upstream name kept, purpose not identified"),
    ("m12_lens_holder",           "m12_lens_holder",          1, "Holder for the M12 camera lens"),
    ("jaw",                       "jaw",                      1, "Lower beak, rigid"),
    ("jaw_soft",                  "jaw_soft",                 1, "Lower beak, flexible (TPU suggested)"),
    ("mouth_top_soft",            "soft_mouth_top",           1, "Upper beak, flexible (TPU suggested)"),
]

STANDARD = [
    ("servo_xl330",               "xl330",                                 15, "Dynamixel XL330 envelope"),
    ("bearing_22x16x4",           "seeed_bearing__configuration__22x16x4", 11, "22 x 16 x 4 mm bearing"),
    ("bearing_15x10x3",           "seeed_bearing__configuration_default",   3, "15 x 10 x 3 mm bearing (ankles and head)"),
    ("battery_np_f550",           "np_f970",                                1, "Upstream mesh is named F970 but measures as an F550, see BOM"),
    ("mainboard_zero_footprint",  "pcb__raspberry_pi_zero_2_w",             1, "Zero-footprint main board; the real board is a Radxa Zero 3W"),
    ("robot_hat_pcb",             "elec_rpi_robot_hat_pcb",                 1, "RPI Robot HAT outline"),
    ("camera_lens",               "lens",                                   1, "M12 lens"),
    ("speaker",                   "speaker",                                1, "Placeholder mesh (12 triangles)"),
]

SKATE = [
    ("skate_ankle_left",  "ankle_l_v1",   1, "Replaces ankle_left; 10 mm taller"),
    ("skate_ankle_right", "ankle_r_v1",   1, "Replaces ankle_right; 10 mm taller"),
    ("skate_blade",       "roller_blade", 2, ""),
    ("skate_rim",         "rim",          4, ""),
    ("skate_tire",        "tire",         8, "Flexible (TPU suggested)"),
]

REMOVED = [
    ("legacy_trunk_shell_left",  "trunk_shell_left",  0, "Referenced by no assembly; deleted upstream in 8dfc08f (2026-09-01)"),
    ("legacy_trunk_shell_right", "trunk_shell_right", 0, "Referenced by no assembly; deleted upstream in 8dfc08f (2026-09-01)"),
]

# Upstream files deliberately not carried over.
SKIPPED = {
    "left_upper_leg":  "duplicate export of upper_leg_left (same face count, bounding box and centroid)",
    "right_upper_leg": "duplicate export of upper_leg_right (same face count, bounding box and centroid)",
}

GROUPS = [
    ("printed-parts",             PRINTED),
    ("standard-parts-not-printed", STANDARD),
    ("variant-roller-skate",      SKATE),
    ("removed-upstream",          REMOVED),
]


def git(upstream, *args, binary=False):
    r = subprocess.run(["git", "-C", upstream, *args], capture_output=True)
    if r.returncode != 0:
        raise RuntimeError(r.stderr.decode(errors="replace").strip())
    return r.stdout if binary else r.stdout.decode()


def ensure_ref(upstream, ref):
    try:
        git(upstream, "cat-file", "-e", f"{ref}^{{commit}}")
    except RuntimeError:
        print(f"{ref} not in local clone, fetching it from origin ...")
        git(upstream, "fetch", "--depth=1", "origin", ref)


def stl_triangles(data):
    if data[:5] == b"solid" and b"facet" in data[:400]:
        return data.count(b"facet normal")
    return struct.unpack("<I", data[80:84])[0]


def print_table():
    print("| Macrodork name | Upstream mesh | Qty | Note |")
    print("|---|---|---|---|")
    for group, rows in GROUPS:
        print(f"| **`{group}/`** | | | |")
        for name, up, qty, note in rows:
            q = f"×{qty}" if qty else "-"
            print(f"| `{name}` | `{up}` | {q} | {note} |")
    print()
    print("Upstream files not carried over:")
    for up, why in SKIPPED.items():
        print(f"- `{up}`: {why}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--upstream", default="upstream/microduck_rl")
    ap.add_argument("--out", default="print")
    ap.add_argument("--ref", default=UPSTREAM_REF)
    ap.add_argument("--table", action="store_true", help="print the name mapping as Markdown and exit")
    a = ap.parse_args()

    if a.table:
        print_table()
        return

    if not os.path.isdir(os.path.join(a.upstream, ".git")):
        sys.exit(f"{a.upstream} is not a git checkout; run scripts/fetch_upstream.sh first")
    ensure_ref(a.upstream, a.ref)

    listed = set(git(a.upstream, "ls-tree", "--name-only", f"{a.ref}:{ASSETS}").split())
    written = 0
    for group, rows in GROUPS:
        d = os.path.join(a.out, group)
        os.makedirs(d, exist_ok=True)
        for name, up, _qty, _note in rows:
            src = f"{up}.stl"
            if src not in listed:
                sys.exit(f"{src} is not in upstream {a.ref}:{ASSETS}")
            data = git(a.upstream, "show", f"{a.ref}:{ASSETS}/{src}", binary=True)
            with open(os.path.join(d, f"{name}.stl"), "wb") as f:
                f.write(data)
            written += 1
            print(f"{group}/{name}.stl  <-  {src}  ({stl_triangles(data)} triangles)")

    carried = {up for _, rows in GROUPS for _, up, _, _ in rows}
    unaccounted = sorted(n[:-4] for n in listed if n.endswith(".stl"))
    unaccounted = [n for n in unaccounted if n not in carried and n not in SKIPPED]
    print(f"\n{written} STLs written to {a.out}/ from upstream {a.ref}")
    if unaccounted:
        print("WARNING: upstream meshes with no mapping (new upstream parts?):", ", ".join(unaccounted))


if __name__ == "__main__":
    main()
