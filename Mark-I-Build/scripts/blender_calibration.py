"""Run in Blender's visible console, then inspect the scene and render through the UI."""
from datetime import datetime, timezone
import json
import struct
from pathlib import Path
import bpy
from mathutils import Vector

ROOT = Path('/Users/coder/repos/offsideai/githubrepos_workspace_active_1/macrodork-docs/Mark-I-Build')


def prepare_calibration():
    if bpy.app.background:
        raise RuntimeError('This workflow requires visible Blender')
    if bpy.data.scenes.get('MarkI_Calibration'):
        raise RuntimeError('Calibration scene exists; inspect before repeating')
    source = ROOT / 'exports/calibration-20mm-r001.stl'
    if not source.exists():
        raise RuntimeError('FreeCAD STL export is missing')
    scene = bpy.data.scenes.new('MarkI_Calibration')
    bpy.context.window.scene = scene
    scene.unit_settings.system = 'METRIC'
    scene.unit_settings.scale_length = 1.0
    scene.unit_settings.length_unit = 'MILLIMETERS'
    bpy.ops.wm.stl_import(filepath=str(source), global_scale=0.001,
                         use_scene_unit=False, forward_axis='Y', up_axis='Z')
    cube = bpy.context.object
    cube.name = 'CalibrationCube20mm'
    bpy.context.view_layer.update()
    dims = list(cube.dimensions)
    assert all(abs(value - 0.020) < 1e-7 for value in dims), dims
    bounds_before = [list(corner) for corner in cube.bound_box]
    material = bpy.data.materials.new('Calibration teal')
    material.diffuse_color = (0.04, 0.42, 0.34, 1)
    material.use_nodes = True
    material.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = material.diffuse_color
    material.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = 0.32
    cube.data.materials.append(material)

    target = cube.location + Vector((0.010, 0.010, 0.010))
    camera_data = bpy.data.cameras.new('Calibration camera')
    camera = bpy.data.objects.new('Calibration camera', camera_data)
    scene.collection.objects.link(camera)
    camera.location = target + Vector((0.060, -0.080, 0.055))
    camera.rotation_euler = (target - camera.location).to_track_quat('-Z', 'Y').to_euler()
    camera_data.lens = 52
    camera_data.clip_start = 0.001
    scene.camera = camera
    for name, offset, energy, size in (
        ('Key softbox', (-0.04, -0.04, 0.07), 2.0, 0.06),
        ('Fill softbox', (0.05, 0.01, 0.04), 0.7, 0.05),
    ):
        light_data = bpy.data.lights.new(name, type='AREA')
        light_data.energy = energy
        light_data.shape = 'DISK'
        light_data.size = size
        light = bpy.data.objects.new(name, light_data)
        scene.collection.objects.link(light)
        light.location = target + Vector(offset)
        light.rotation_euler = (target - light.location).to_track_quat('-Z', 'Y').to_euler()
    scene.world = bpy.data.worlds.new('Calibration world')
    scene.world.use_nodes = True
    scene.world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.07, 0.08, 0.1, 1)
    scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.3

    preferences = bpy.context.preferences.addons['cycles'].preferences
    preferences.get_devices_for_type('METAL')
    devices = [{'name': d.name, 'type': d.type, 'enabled': d.use} for d in preferences.devices]
    assert preferences.compute_device_type == 'METAL', preferences.compute_device_type
    assert any(d['type'] == 'METAL' and d['enabled'] for d in devices), devices
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'GPU'
    scene.cycles.samples = 32
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 640
    scene.render.resolution_y = 480
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    (ROOT / 'blender').mkdir(exist_ok=True)
    (ROOT / 'renders').mkdir(exist_ok=True)
    scene.render.filepath = str(ROOT / 'renders/calibration-20mm-r001.png')
    for screen in bpy.data.screens:
        for area in screen.areas:
            for space in area.spaces:
                if space.type == 'VIEW_3D':
                    space.clip_start = 0.001
                    space.region_3d.view_distance = 0.12
                    space.region_3d.view_location = target
    bpy.ops.object.select_all(action='DESELECT')
    cube.select_set(True)
    bpy.context.view_layer.objects.active = cube
    bpy.ops.wm.save_as_mainfile(filepath=str(ROOT / 'blender/calibration-20mm-r001.blend'))
    report = {
        'recorded_at_utc': datetime.now(timezone.utc).isoformat(),
        'blender_version': bpy.app.version_string,
        'mode': 'visible Blender GUI console', 'background': bpy.app.background,
        'source': str(source.relative_to(ROOT)), 'stl_import_scale': 0.001,
        'scene_unit_scale': scene.unit_settings.scale_length,
        'dimensions_m': dims, 'bounds_after_import': bounds_before,
        'render_engine': scene.render.engine, 'render_device': scene.cycles.device,
        'cycles_backend': preferences.compute_device_type, 'devices': devices,
        'dimension_check': 'pass', 'render_status': 'pending',
    }
    (ROOT / 'logs/blender-calibration-003.json').write_text(json.dumps(report, indent=2) + '\n')
    print('BLENDER_PYTHON_OK', bpy.app.version_string)
    print('PASS: imported cube dimensions in metres:', dims)
    print('Scene saved; Cycles / Metal GPU ready. Use visible Render > Render Image next.')


def save_render_result():
    result = bpy.data.images.get('Render Result')
    if bpy.app.background or bpy.app.is_job_running('RENDER'):
        raise RuntimeError('Use the visible GUI after rendering finishes')
    if result is None:
        raise RuntimeError('Render Result is missing')
    scene = bpy.data.scenes['MarkI_Calibration']
    output = ROOT / 'renders/calibration-20mm-r001.png'
    result.save_render(str(output), scene=scene)
    header = output.read_bytes()[:24]
    if header[:8] != b'\x89PNG\r\n\x1a\n' or header[12:16] != b'IHDR':
        raise RuntimeError('Saved output is not a PNG')
    dimensions = struct.unpack('>II', header[16:24])
    if dimensions != (640, 480):
        raise RuntimeError(f'Unexpected PNG dimensions: {dimensions}')
    path = ROOT / 'logs/blender-calibration-003.json'
    report = json.loads(path.read_text())
    report['render_status'] = 'complete'
    report['render_size_px'] = list(dimensions)
    report['render_result_reported_size_px'] = list(result.size)
    report['render_validation'] = 'PNG signature and IHDR dimensions; visual inspection recorded separately'
    report['render_output'] = 'renders/calibration-20mm-r001.png'
    report['render_saved_at_utc'] = datetime.now(timezone.utc).isoformat()
    path.write_text(json.dumps(report, indent=2) + '\n')
    print('PASS: visible render saved at', scene.render.filepath)


print('Loaded foreground calibration helper. Run prepare_calibration().')
