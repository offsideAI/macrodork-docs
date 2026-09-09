import bpy
import math
from mathutils import Vector
from math import sin, cos, pi

ROOT = '/Users/coder/repos/offsideai/githubrepos_workspace_active_1/macrodork-docs/Mark-I-Build'

def collection(name):
    c = bpy.data.collections.get(name)
    if c is None:
        c = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(c)
    return c

def move_to(o, c):
    for old in list(o.users_collection):
        old.objects.unlink(o)
    c.objects.link(o)
    return o

def mat(name, rgb, metal=0.0, rough=0.4, emission=0):
    m=bpy.data.materials.get(name)
    if m is None:
        m=bpy.data.materials.new(name)
    m.diffuse_color=(*rgb,1)
    m.use_nodes=True
    b=m.node_tree.nodes.get('Principled BSDF')
    b.inputs['Base Color'].default_value=(*rgb,1)
    b.inputs['Metallic'].default_value=metal
    b.inputs['Roughness'].default_value=rough
    if emission:
        b.inputs['Emission Color'].default_value=(*rgb,1)
        b.inputs['Emission Strength'].default_value=emission
    return m

def finish(o, name, material, c, bevel=0):
    o.name=name
    move_to(o,c)
    if material: o.data.materials.append(material)
    if o.type=='MESH':
        for p in o.data.polygons: p.use_smooth=True
        if bevel:
            b=o.modifiers.new('Soft manufactured edges','BEVEL'); b.width=bevel; b.segments=4
            n=o.modifiers.new('Surface normals','WEIGHTED_NORMAL'); n.keep_sharp=True
    o['design_revision']='Mark-I concept R001'
    return o

def box(name, loc, dims, material, c, bevel=0.015):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o=bpy.context.object; o.dimensions=dims
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    return finish(o,name,material,c,min(bevel,min(dims)*0.48))

def cyl(name, loc, radius, depth, material, c, axis='Z', bevel=0.003, vertices=64):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=radius,depth=depth,location=loc)
    o=bpy.context.object
    if axis=='X':o.rotation_euler[1]=pi/2
    if axis=='Y':o.rotation_euler[0]=pi/2
    return finish(o,name,material,c,bevel)

def sphere(name,loc,dims,material,c):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48,ring_count=24,radius=1,location=loc)
    o=bpy.context.object;o.scale=tuple(v/2 for v in dims)
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    return finish(o,name,material,c)

def curve(name, points, radius, material,c):
    d=bpy.data.curves.new(name,'CURVE');d.dimensions='3D';d.resolution_u=2;d.bevel_depth=radius;d.bevel_resolution=4
    s=d.splines.new('POLY');s.points.add(len(points)-1)
    for p,co in zip(s.points,points):p.co=(*co,1)
    o=bpy.data.objects.new(name,d);c.objects.link(o);d.materials.append(material)
    return o

def torus(name,loc,major,minor,material,c,axis='Z'):
    bpy.ops.mesh.primitive_torus_add(major_segments=64,minor_segments=12,location=loc,major_radius=major,minor_radius=minor)
    o=bpy.context.object
    if axis=='X':o.rotation_euler[1]=pi/2
    if axis=='Y':o.rotation_euler[0]=pi/2
    return finish(o,name,material,c)

def empty(name,loc,c):
    o=bpy.data.objects.new(name,None);c.objects.link(o);o.location=loc;o.empty_display_size=.045;o.empty_display_type='ARROWS';return o

def parent_keep(o,p):
    bpy.context.view_layer.update(); w=o.matrix_world.copy();o.parent=p;o.matrix_world=w

def label(name,text,loc,size,material,c):
    d=bpy.data.curves.new(name,'FONT');d.body=text;d.size=size;d.align_x='CENTER';d.extrude=.00015;d.space_character=1.15
    o=bpy.data.objects.new(name,d);c.objects.link(o);o.location=loc;o.rotation_euler=(pi/2,0,0);d.materials.append(material);return o

def shell_profile(name,rings,material,c,n=64,power=2.7):
    verts=[];faces=[]
    for z,rx,ry in rings:
        for j in range(n):
            t=j*2*pi/n;a=cos(t);b=sin(t)
            verts.append((rx*math.copysign(abs(a)**(2/power),a),ry*math.copysign(abs(b)**(2/power),b),z))
    for k in range(len(rings)-1):
        for j in range(n):a=k*n+j;b=k*n+(j+1)%n;faces.append((a,b,b+n,a+n))
    faces.append(tuple(range(n-1,-1,-1)));faces.append(tuple((len(rings)-1)*n+j for j in range(n)))
    d=bpy.data.meshes.new(name);d.from_pydata(verts,[],faces);d.update();o=bpy.data.objects.new(name,d);c.objects.link(o);d.materials.append(material)
    for p in d.polygons:p.use_smooth=True
    sub=o.modifiers.new('Continuous shell curvature','SUBSURF');sub.levels=2;sub.render_levels=2
    o['fabrication_status']='Concept exterior surface; wall thickness and fasteners not engineered'
    return o

silver=mat('MI | satin silver',(.43,.47,.52),.72,.29)
light_silver=mat('MI | brushed edge',(.62,.66,.71),.8,.23)
dark=mat('MI | graphite',(.025,.033,.045),.5,.3)
rubber=mat('MI | tire rubber',(.018,.022,.028),.05,.72)
black=mat('MI | optical surround',(.007,.012,.02),.35,.23)
glass=mat('MI | coated lens',(.008,.025,.044),.82,.085)
amber=mat('MI | amber light',(1,.27,.025),.15,.23,3)
paint=mat('MI | amber marking',(.85,.21,.025),.2,.4)
board=mat('MI | PCB placeholder',(.02,.19,.08),.15,.6)
