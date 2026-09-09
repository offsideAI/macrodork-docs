# Send through Blender MCP with VIEW set to one of the keys below.
# Invoke one view at a time; wait for its visible render to finish.
import bpy
ROOT='/Users/coder/repos/offsideai/githubrepos_workspace_active_1/macrodork-docs/Mark-I-Build'
VIEW='hero'
views={
 'hero':('MarkI_R001','CAM | full body hero',1200,1500),
 'front':('MarkI_R001','CAM | front',1200,1500),
 'rear':('MarkI_R001','CAM | rear',1200,1500),
 'head-detail':('MarkI_R001','CAM | head detail',1500,1200),
 'head-concepts':('MarkI_Head_Concepts_R001','CAM | three head concepts',2100,850),
}
assert not bpy.app.background
assert not bpy.app.is_job_running('RENDER')
name,camera,width,height=views[VIEW]
s=bpy.data.scenes[name];bpy.context.window.scene=s;s.frame_set(1)
s.camera=bpy.data.objects[camera];s.render.resolution_x=width;s.render.resolution_y=height;s.render.resolution_percentage=100
s.render.filepath=ROOT+'/renders/mark-i-r001-'+VIEW+'.png'
bpy.ops.render.render('INVOKE_DEFAULT',write_still=True)
print('Started visible render',VIEW)
