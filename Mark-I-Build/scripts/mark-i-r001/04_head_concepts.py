main=bpy.data.scenes['MarkI_R001'];main.frame_set(1)
assert not bpy.app.is_job_running('RENDER'),'Wait for current render'
assert bpy.data.scenes.get('MarkI_Head_Concepts_R001') is None,'Comparison scene exists'
compare=bpy.data.scenes.new('MarkI_Head_Concepts_R001');bpy.context.window.scene=compare
compare.unit_settings.system='METRIC';compare.unit_settings.scale_length=1;compare['concept_only']=True
compare['description']='Three original head silhouette studies; camera pupils stay circular; main scene uses A'
src=bpy.data.collections['MI 05 | head A - Explorer']
for letter,title,offset,sx,sz in [('A','EXPLORER',-.62,1,1),('B','SCOUT',0,.89,1.13),('C','SURVEYOR',.62,1.08,.90)]:
    c=collection('MI CONCEPT '+letter+' | '+title)
    for original in src.objects:
        o=original.copy();o.data=original.data.copy();o.animation_data_clear();o.parent=None;o.matrix_world=original.matrix_world.copy();c.objects.link(o)
        o.name=letter+' | '+original.name
        o.location.x=o.location.x*sx+offset
        o.location.z=1.399+(o.location.z-1.399)*sz
        if any(part in original.name for part in ['front shell','rear service cap','rear seam']):
            o.scale.x*=sx;o.scale.z*=sz
        if 'binocular bridge' in original.name:o.scale.x*=sx
        if 'amber arc' in original.name:
            ex=-.134 if 'Eye -1' in original.name else .134
            o.location.x=offset+ex*(sx-1);o.location.z=.012*(sz-1)
        o['variant']=letter;o['manufacturing_status']='Exterior study, unvalidated'
    cyl(letter+' | display mount',(offset,.0,1.205),.05,.14,dark,c)
    cyl(letter+' | display foot',(offset,.0,1.139),.102,.018,silver,c)
    label(letter+' | name',letter+'  /  '+title,(offset,-.10,1.07),.026,light_silver,c)
    label(letter+' | description',{'A':'BALANCED / REFERENCE','B':'COMPACT / UPRIGHT','C':'WIDE / OBSERVANT'}[letter],(offset,-.10,1.037),.01,light_silver,c)
# Reuse studio lights and ground without copying their data.
lights=bpy.data.collections['MI 90 | studio']
for original in lights.objects:
    if original.type=='LIGHT' or original.name=='Studio | ground':compare.collection.objects.link(original)
compare.world=main.world
camdata=bpy.data.cameras.new('CAM | three head concepts');cam=bpy.data.objects.new('CAM | three head concepts',camdata);compare.collection.objects.link(cam)
cam.location=(.15,-5,2.0);cam.rotation_euler=(Vector((0,0,1.31))-cam.location).to_track_quat('-Z','Y').to_euler();camdata.type='ORTHO';camdata.ortho_scale=2.00;compare.camera=cam
compare.render.engine='CYCLES';compare.cycles.device='GPU';compare.cycles.samples=48;compare.cycles.use_denoising=True
compare.render.resolution_x=2100;compare.render.resolution_y=850;compare.render.resolution_percentage=100;compare.render.image_settings.file_format='PNG';compare.view_settings.view_transform='AgX'
compare.render.filepath=ROOT+'/renders/mark-i-r001-head-concepts.png'
for screen in bpy.data.screens:
    for area_ui in screen.areas:
        if area_ui.type=='VIEW_3D':area_ui.spaces.active.region_3d.view_perspective='CAMERA'
print('THREE_HEAD_CONCEPTS_READY')
