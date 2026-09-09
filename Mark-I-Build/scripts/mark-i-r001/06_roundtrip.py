import bpy
from mathutils import Vector
import json
main=bpy.data.scenes['MarkI_R001']
test=bpy.data.scenes.new('MI_GLBRoundtrip_Check')
bpy.context.window.scene=test
bpy.ops.import_scene.gltf(filepath='/Users/coder/repos/offsideai/githubrepos_workspace_active_1/macrodork-docs/Mark-I-Build/exports/mark-i-full-body-r001.glb')
bpy.context.view_layer.update()
points=[o.matrix_world @ Vector(corner) for o in test.objects if o.type=='MESH' for corner in o.bound_box]
dims=[max(p[i] for p in points)-min(p[i] for p in points) for i in range(3)]
assert abs(dims[2]-1.524)<.001, dims
print('GLB_ROUNDTRIP_JSON',json.dumps({'dimensions_m':dims,'mesh_objects':sum(o.type=='MESH' for o in test.objects),'height_check':'pass'}))
for o in list(test.objects):bpy.data.objects.remove(o,do_unlink=True)
bpy.context.window.scene=main
bpy.data.scenes.remove(test)
main.frame_set(1)
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type=='VIEW_3D':
            area.spaces.active.region_3d.view_camera_zoom=12
            area.spaces.active.shading.type='MATERIAL'
bpy.ops.wm.save_as_mainfile(filepath='/Users/coder/repos/offsideai/githubrepos_workspace_active_1/macrodork-docs/Mark-I-Build/blender/mark-i-full-body-r001.blend')
