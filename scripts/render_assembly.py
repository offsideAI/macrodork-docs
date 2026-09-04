#!/usr/bin/env python3
"""Render Macrodork assembly drawings / exploded views from the upstream MJCF.

Rendered straight from the MJCF: 4 plain views + 2 exploded views + 1 colour-coded reference.
Exploded views offset each body along the kinematic chain, further out toward the
chain ends, and label each part with its name and mass.

Usage:
    python scripts/render_assembly.py <upstream microduck_rl path> [output directory]
"""
import sys, os
import numpy as np
import mujoco
from PIL import Image, ImageDraw, ImageFont

MJCF = "src/mjlab_microduck/robot/microduck/robot_allcollisions.xml"
STEP = 0.048          # exploded-view offset per chain level (m)
W, H = 1600, 2100

# Rendering needs a larger offscreen framebuffer and a white skybox; injected into the MJCF
INJECT = """  <visual>
    <global offwidth="2200" offheight="2600" fovy="42"/>
    <quality shadowsize="4096" offsamples="8"/>
    <headlight ambient="0.55 0.55 0.55" diffuse="0.45 0.45 0.45" specular="0.15 0.15 0.15"/>
  </visual>
  <asset>
    <texture type="skybox" builtin="flat" rgb1="1 1 1" rgb2="1 1 1" width="256" height="256"/>
  </asset>
"""

LABELS = {
    'trunk_base':'Trunk body 199g','yaw2roll':'Left hip yaw-roll 23g','hip_l':'Left hip roll part 6g',
    'upper_leg_left':'Left upper leg 48g','leg':'Left lower leg 22g','ankle_left':'Left ankle+foot 30g',
    'neck':'Neck base 37g','neck_pitch':'Neck pitch part 6g','yaw_roll_motion':'Head yaw/roll mechanism 49g',
    'jaw_soft':'Head assembly+beak 189g','bearing_roll':'Right hip yaw-roll 23g','hip_l_2':'Right hip roll part 6g',
    'upper_leg_right':'Right upper leg 48g','leg_2':'Right lower leg 22g','ankle_right':'Right ankle+foot 30g',
    # Upstream renamed a few bodies between revisions; map both spellings.
    'left_upper_leg':'Left upper leg 48g','right_upper_leg':'Right upper leg 48g',
    'bottom_head_shell':'Head assembly+beak 189g',
}
PAL = [(214,69,65),(240,142,42),(232,196,45),(120,182,66),(48,160,120),(52,152,190),
       (60,105,190),(120,90,195),(190,80,175),(225,105,140),(150,110,70),(90,120,140),
       (200,160,90),(70,175,175),(175,175,60)]

# First TrueType font found is used for labels; add your own path if none of these exist
FONT_CANDIDATES = ["C:/Windows/Fonts/segoeui.ttf",
                   "C:/Windows/Fonts/arial.ttf",
                   "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
                   "/System/Library/Fonts/Supplemental/Arial.ttf",
                   "/System/Library/Fonts/Helvetica.ttc"]


def find_font():
    for p in FONT_CANDIDATES:
        if os.path.exists(p):
            return p
    return None


def prepare_mjcf(src, dst):
    s = open(src, encoding='utf-8').read()
    s = s.replace('<mujoco model="microduck">', '<mujoco model="microduck">\n' + INJECT, 1)
    open(dst, 'w', encoding='utf-8').write(s)


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    root = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else "assembly-drawings"
    os.makedirs(out, exist_ok=True)

    src = os.path.join(root, MJCF)
    if not os.path.exists(src):
        sys.exit("MJCF not found: " + src + "\nRun scripts/fetch_upstream.sh first")
    tmp = os.path.join(os.path.dirname(src), "_render_tmp.xml")
    prepare_mjcf(src, tmp)

    try:
        m = mujoco.MjModel.from_xml_path(tmp)
        d = mujoco.MjData(m)
        d.qpos[:] = 0
        d.qpos[3] = 1.0                            # unit quaternion for the free joint = zero-position reference
        mujoco.mj_forward(m, d)

        names = [mujoco.mj_id2name(m, mujoco.mjtObj.mjOBJ_BODY, i) for i in range(m.nbody)]
        bodies = list(range(1, m.nbody))
        col = {b: PAL[k % len(PAL)] for k, b in enumerate(bodies)}
        xp0 = d.xpos.copy()

        def chain_offset(b):
            off, cur = np.zeros(3), b
            while cur > 1:
                p = m.body_parentid[cur]
                v = xp0[cur] - xp0[p]
                n = np.linalg.norm(v)
                off += (v / n if n > 1e-6 else np.array([0, 0, -1.0])) * STEP
                cur = p
            return off

        OFF = {b: chain_offset(b) for b in bodies}

        vopt = mujoco.MjvOption()
        vopt.geomgroup[:] = 0
        vopt.geomgroup[2] = 1                      # render visual meshes only
        r = mujoco.Renderer(m, H, W)
        cam = mujoco.MjvCamera()
        font_path = find_font()

        def proj(p, fovy=42.0):
            """World coordinates -> pixel coordinates, used to draw label leader lines."""
            az, el = np.radians(cam.azimuth), np.radians(cam.elevation)
            fwd = np.array([np.cos(el)*np.cos(az), np.cos(el)*np.sin(az), np.sin(el)])
            cpos = np.array(cam.lookat) - cam.distance * fwd
            rt = np.cross(fwd, [0, 0, 1.0])
            rt /= np.linalg.norm(rt)
            up = np.cross(rt, fwd)
            v = np.array(p) - cpos
            zc = v @ fwd
            if zc <= 1e-6:
                return None
            f = 1 / np.tan(np.radians(fovy) / 2)
            a = W / H
            return (((v @ rt)/zc*f/a*0.5+0.5)*W, (1-((v @ up)/zc*f*0.5+0.5))*H)

        def colorize():
            for g in range(m.ngeom):
                if m.geom_group[g] != 2:
                    continue
                c = col[m.geom_bodyid[g]]
                m.geom_matid[g] = -1
                m.geom_rgba[g] = [c[0]/255, c[1]/255, c[2]/255, 1.0]

        def shoot(fn, az, el, exploded, title, dscale=1.0, label=True):
            d.qpos[:] = 0
            d.qpos[3] = 1.0
            mujoco.mj_forward(m, d)
            if exploded:
                for g in range(m.ngeom):
                    b = m.geom_bodyid[g]
                    if b in OFF:
                        d.geom_xpos[g] = d.geom_xpos[g] + OFF[b]
            C = {b: (xp0[b] + (OFF[b] if exploded else 0)) for b in bodies}
            P = np.array([d.geom_xpos[g] for g in range(m.ngeom) if m.geom_group[g] == 2])
            ctr = (P.min(0) + P.max(0)) / 2
            span = (P.max(0) - P.min(0)).max()
            cam.azimuth, cam.elevation = az, el
            cam.lookat[:] = ctr
            cam.distance = (span * 1.55 + 0.10) * dscale
            r.update_scene(d, cam, vopt)
            img = Image.fromarray(r.render()).convert('RGB')

            if label and font_path:
                dr = ImageDraw.Draw(img)
                ft = ImageFont.truetype(font_path, 32)
                ftt = ImageFont.truetype(font_path, 46)
                dr.text((40, 32), title, fill=(20, 20, 20), font=ftt)
                placed = []
                for b in bodies:
                    pp = proj(C[b])
                    if pp is None:
                        continue
                    x, y = pp
                    if not (0 < x < W and 0 < y < H):
                        continue
                    c = col[b]
                    lab = LABELS.get(names[b], names[b])
                    tw = dr.textlength(lab, font=ft)
                    tx, ty = x + 58, y - 20
                    if tx + tw + 20 > W:           # would run off the right edge: put the label on the left
                        tx = x - 58 - tw
                    for (px, py) in placed:        # simple avoidance to keep labels from overlapping
                        if abs(py - ty) < 44 and abs(px - tx) < 430:
                            ty = py + 46
                    placed.append((tx, ty))
                    anchor = (tx - 8, ty + 17) if tx > x else (tx + tw + 8, ty + 17)
                    dr.line([(x, y), anchor], fill=c, width=4)
                    dr.ellipse([x-9, y-9, x+9, y+9], fill=c, outline=(255,255,255), width=3)
                    bb = dr.textbbox((tx, ty), lab, font=ft)
                    dr.rectangle([bb[0]-9, bb[1]-6, bb[2]+9, bb[3]+6],
                                 fill=(255,255,255), outline=c, width=3)
                    dr.text((tx, ty), lab, fill=(25,25,25), font=ft)

            img.save(os.path.join(out, fn + ".png"))
            print("  ok", fn)

        for fn, title, (az, el) in [('01_front', 'Front view', (90, -5)),
                                    ('02_side', 'Side view', (0, -5)),
                                    ('03_back', 'Back view', (270, -5)),
                                    ('04_three_quarter', 'Three-quarter view', (40, -12))]:
            shoot(fn, az, el, False, title, 1.15, label=False)

        colorize()
        shoot('05_exploded_side', 0, -6, True,
              'Macrodork exploded view - side (zero-position reference)')
        shoot('06_exploded_three_quarter', 42, -14, True,
              'Macrodork exploded view - three-quarter (zero-position reference)')
        shoot('07_color_coded_assembled', 42, -12, False,
              'Macrodork colour-coded parts - assembled state', 1.15)
        r.close()
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)


if __name__ == '__main__':
    main()
