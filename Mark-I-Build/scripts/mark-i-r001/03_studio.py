scene=bpy.data.scenes['MarkI_R001'];bpy.context.window.scene=scene;scene.frame_set(1)
# Give the narrow rear cap the same rounded face outline as the main shell.
for name,w,h,depth,r in [('Head A | rear service cap',.47,.231,.047,.060),('Head A | rear seam',.474,.234,.008,.061)]:
    o=bpy.data.objects[name];v=[];f=[]
    outline=[]
    for cx,cz,start in [(w/2-r,h/2-r,0),(-w/2+r,h/2-r,90),(-w/2+r,-h/2+r,180),(w/2-r,-h/2+r,270)]:
        for j in range(13):
            a=math.radians(start+j*90/12);outline.append((cx+r*cos(a),cz+r*sin(a)))
    n=len(outline)
    for y in [-depth/2,depth/2]:
        for x,z in outline:v.append((x,y,z))
    for j in range(n):f.append((j,(j+1)%n,(j+1)%n+n,j+n))
    f.append(tuple(range(n-1,-1,-1)));f.append(tuple(range(n,2*n)))
    d=bpy.data.meshes.new(name+' rounded outline');d.from_pydata(v,[],f);d.update()
    d.materials.append(silver if 'cap' in name else dark);o.data=d
    for mod in list(o.modifiers):o.modifiers.remove(mod)
    bevel=o.modifiers.new('Cap edge radius','BEVEL');bevel.width=.0015;bevel.segments=3
    o.modifiers.new('Cap surface normals','WEIGHTED_NORMAL')
studio=collection('MI 90 | studio')
floor_mat=mat('MI | studio warm grey',(.25,.27,.30),.1,.7)
box('Studio | ground',(0,0,-.027),(200,200,.05),floor_mat,studio,.001)
world=bpy.data.worlds.new('MI | soft studio world');world.use_nodes=True
world.node_tree.nodes['Background'].inputs['Color'].default_value=(.38,.42,.5,1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value=.32;scene.world=world

def area(name,loc,target,energy,size,color):
    d=bpy.data.lights.new(name,'AREA');d.energy=energy;d.shape='DISK';d.size=size;d.color=color
    o=bpy.data.objects.new(name,d);studio.objects.link(o);o.location=loc;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();return o
area('Studio | broad key',(-2.8,-3.0,3.7),(0,0,.85),500,3.0,(.88,.94,1))
area('Studio | soft front',(2.5,-2.2,2.2),(0,0,.9),220,2.1,(1,.86,.71))
area('Studio | silver rim',(1.3,2.0,3.0),(0,0,1),650,2,(.72,.84,1))
area('Studio | lens catchlight',(-.6,-2.5,1.9),(0,0,1.3),45,.75,(1,1,1))

def camera(name,loc,target,ortho):
    d=bpy.data.cameras.new(name);o=bpy.data.objects.new(name,d);studio.objects.link(o);o.location=loc;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();d.type='ORTHO';d.ortho_scale=ortho;d.clip_start=.01;d.clip_end=300;return o
hero=camera('CAM | full body hero',(2.3,-4.5,2.15),(0,0,.78),1.94)
camera('CAM | front',(0,-5,1.0),(0,0,.78),1.91)
camera('CAM | rear',(2.5,4,1.9),(0,0,.8),1.96)
camera('CAM | head detail',(.95,-2,1.75),(0,-.015,1.34),.77)
scene.camera=hero
scene.render.engine='CYCLES';scene.cycles.device='GPU';scene.cycles.samples=48;scene.cycles.use_denoising=True
scene.render.resolution_x=1200;scene.render.resolution_y=1500;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False
scene.render.filepath=ROOT+'/renders/mark-i-r001-hero.png'
scene.view_settings.view_transform='AgX'
for screen in bpy.data.screens:
    for area_ui in screen.areas:
        if area_ui.type=='VIEW_3D':
            s=area_ui.spaces.active;s.region_3d.view_perspective='CAMERA';s.overlay.show_overlays=False;s.shading.color_type='MATERIAL'
bpy.ops.object.select_all(action='DESELECT')
scene['animation_note']='Frames 1 and 120 neutral; 30 and 60 expression studies. Limits and clearances require engineering.'
bpy.ops.wm.save_as_mainfile(filepath=ROOT+'/blender/mark-i-full-body-r001.blend')
print('STUDIO_READY; saved editable full-body scene; hero render 1200 x 1500')
