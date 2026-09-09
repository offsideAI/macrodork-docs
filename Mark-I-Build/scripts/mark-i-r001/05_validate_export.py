import json
scene=bpy.data.scenes['MarkI_R001'];bpy.context.window.scene=scene;scene.frame_set(1)
assert not bpy.app.is_job_running('RENDER'),'Wait for render'
bpy.context.view_layer.update()
visible=[]
for c in scene.collection.children:
    if c.name.startswith('MI 0') and not c.hide_render:
        visible.extend(o for o in c.objects if o.type in {'MESH','CURVE','FONT'})
deps=bpy.context.evaluated_depsgraph_get();points=[]
for o in visible:
    e=o.evaluated_get(deps)
    for corner in e.bound_box:points.append(e.matrix_world @ Vector(corner))
mins=[min(p[i] for p in points) for i in range(3)];maxs=[max(p[i] for p in points) for i in range(3)]
dims=[maxs[i]-mins[i] for i in range(3)]
assert abs(dims[2]-1.524)<.001, dims
assert all(all(math.isfinite(v) for v in o.location) for o in visible)
report={'scene':scene.name,'neutral_frame':1,'scene_scale_m':scene.unit_settings.scale_length,'robot_bounds_min_m':mins,'robot_bounds_max_m':maxs,'robot_dimensions_m':dims,'height_target_m':1.524,'height_check_tolerance_m':.001,'height_check':'pass','visible_robot_objects':len(visible),'head_camera_baseline_study_m':.268,'main_head_shell_dimensions_m':list(bpy.data.objects['Head A | satin front shell'].dimensions),'yaw_limit_degrees':[-90,90],'pitch_study_limit_degrees':[-20,25],'roll_study_limit_degrees':[-15,15],'animation_frames':[1,120],'provenance':'Original reference-based concept, no measured Asimov import','unverified':['component fits','optics and stereo calibration','mass and torque','stability','wall thickness and manufacturing','battery runtime','BOM pricing','collision clearance through articulation']}
scene['verification_report']=json.dumps(report)
# Restore the main presentation view before final native save.
scene.camera=bpy.data.objects['CAM | full body hero'];scene.render.resolution_x=1200;scene.render.resolution_y=1500;scene.render.filepath=ROOT+'/renders/mark-i-r001-hero.png'
for screen in bpy.data.screens:
    for area_ui in screen.areas:
        if area_ui.type=='VIEW_3D':area_ui.spaces.active.region_3d.view_perspective='CAMERA'
bpy.ops.object.select_all(action='DESELECT')
for o in visible:o.select_set(True)
for o in bpy.data.collections['MI 00 | articulation'].objects:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=ROOT+'/exports/mark-i-full-body-r001.glb',export_format='GLB',use_selection=True,use_active_scene=True,export_animations=False,export_apply=True)
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.wm.save_as_mainfile(filepath=ROOT+'/blender/mark-i-full-body-r001.blend')
print('MARK_I_VALIDATION_JSON',json.dumps(report))
