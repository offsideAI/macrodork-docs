scene=bpy.data.scenes['MarkI_R001'];bpy.context.window.scene=scene
neck=collection('MI 04 | three-axis neck');head=collection('MI 05 | head A - Explorer');rig=collection('MI 00 | articulation');pack=collection('MI 06 | internal envelopes - unverified')
assert bpy.data.objects.get('Head | yaw turntable') is None,'Head already exists'
yaw=empty('Head | yaw turntable',(0,0,1.15),rig)
pitch=empty('Head | pitch nod',(0,0,1.248),rig)
roll=empty('Head | roll tilt',(0,0,1.30),rig)
parent_keep(pitch,yaw);parent_keep(roll,pitch)
for o,axis,low,high in [(yaw,'z',-90,90),(pitch,'x',-20,25),(roll,'y',-15,15)]:
    con=o.constraints.new('LIMIT_ROTATION');con.owner_space='LOCAL'
    if axis=='z':con.use_limit_z=True;con.min_z=math.radians(low);con.max_z=math.radians(high)
    if axis=='x':con.use_limit_x=True;con.min_x=math.radians(low);con.max_x=math.radians(high)
    if axis=='y':con.use_limit_y=True;con.min_y=math.radians(low);con.max_y=math.radians(high)
    o['axis']=axis;o['range_degrees']=[low,high];o['range_status']='User-defined yaw; pitch/roll provisional study limits'
cyl('Neck | fixed turntable flange',(0,0,1.143),.096,.022,light_silver,neck)
torus('Neck | base seal',(0,0,1.157),.081,.008,black,neck)
for o in [cyl('Neck | yaw housing',(0,0,1.19),.067,.063,dark,neck),cyl('Neck | yaw trim',(0,0,1.167),.072,.012,silver,neck)]:parent_keep(o,yaw)
for side in [-1,1]:
    o=box('Neck | pitch yoke',(side*.055,0,1.23),(.025,.085,.086),dark,neck,.012);parent_keep(o,yaw)
    for r,d,xx,m in [(.037,.018,side*.068,silver),(.025,.019,side*.078,dark),(.010,.021,side*.083,light_silver)]:
        o=cyl('Neck | nod bearing',(xx,0,1.248),r,d,m,neck,'X');parent_keep(o,pitch)
for o in [cyl('Neck | nod carrier',(0,0,1.248),.037,.095,dark,neck,'X'),cyl('Neck | tilt mount',(0,0,1.283),.048,.061,dark,neck,'Y')]:parent_keep(o,pitch)
parent_keep(box('Head | underside carrier',(0,0,1.282),(.174,.14,.023),dark,head,.012),roll)
# Split shell with a rear service cap; neutral highest point exactly 1.524 m.
front=box('Head A | satin front shell',(0,-.021,1.399),(.50,.244,.25),silver,head,.071)
rear=box('Head A | rear service cap',(0,.112,1.399),(.47,.047,.231),silver,head,.021)
parent_keep(front,roll);parent_keep(rear,roll)
# Rear service band and cooling slots.
parent_keep(box('Head A | rear seam',(0,.098,1.399),(.474,.008,.234),dark,head,.003),roll)
for j in range(9):
    parent_keep(box('Head | exhaust slot',((j-4)*.018,.138,1.395),(.008,.004,.061),black,head,.002),roll)
for x in [-.172,.172]:
    parent_keep(cyl('Head | rear service screw',(x,.139,1.345),.003,.004,dark,head,'Y',.0005,16),roll)
parent_keep(box('Eyes | binocular bridge',(0,-.148,1.411),(.205,.016,.016),dark,head,.006),roll)
for side in [-1,1]:
    ex=side*.134;ez=1.411
    items=[]
    items.append(cyl('Eye '+str(side)+' | socket',(ex,-.146,ez),.085,.023,dark,head,'Y',.004))
    items.append(torus('Eye | machined lip',(ex,-.161,ez),.078,.004,light_silver,head,'Y'))
    items.append(cyl('Eye '+str(side)+' | optical barrel',(ex,-.169,ez),.075,.032,black,head,'Y',.004))
    items.append(torus('Eye | internal baffle',(ex,-.189,ez),.063,.008,dark,head,'Y'))
    items.append(sphere('Eye '+str(side)+' | camera lens',(ex,-.193,ez),(.115,.022,.115),glass,head))
    items.append(cyl('Eye | entrance pupil',(ex,-.206,ez),.025,.003,black,head,'Y',.001))
    items.append(torus('Eye | optical coating ring',(ex,-.209,ez),.026,.0015,glass,head,'Y'))
    # Outer crescent marks, optically separated from central camera pupil.
    start=55 if side==1 else 125
    end=-55 if side==1 else 235
    points=[]
    for j in range(49):
        a=math.radians(start+(end-start)*j/48)
        points.append((ex+.069*cos(a),-.194,ez+.069*sin(a)))
    items.append(curve('Eye '+str(side)+' | amber arc',points,.003,amber,head))
    for o in items:parent_keep(o,roll)
# Side acoustic discs; no decorative stalks.
for side in [-1,1]:
    for r,d,x,m in [(.051,.012,side*.245,dark),(.041,.014,side*.253,black),(.033,.016,side*.257,silver)]:
        parent_keep(cyl('Head | speaker side cover',(x,.015,1.396),r,d,m,head,'X'),roll)
    for j in range(5):
        parent_keep(box('Head | acoustic slot',(side*.267,.015+(j-2)*.009,1.396),(.002,.003,.042-abs(j-2)*.006),black,head,.0008),roll)
for x in [-.042,.042]:parent_keep(cyl('Head | microphone port',(x,-.142,1.32),.0022,.004,black,head,'Y',.0004,16),roll)
parent_keep(label('Head | serial marking','M-I / STEREO',(0,-.144,1.322),.009,dark,head),roll)
# Simplified packaging envelopes; explicit placeholders, hidden from beauty renders.
for name,loc,dims,m in [
    ('PLACEHOLDER | Pi 5 8GB board allowance',(0,.025,1.399),(.095,.07,.02),board),
    ('PLACEHOLDER | Pi cooling allowance',(0,.025,1.426),(.075,.06,.032),dark),
    ('PLACEHOLDER | stereo camera L',(-.134,-.11,1.411),(.035,.035,.035),board),
    ('PLACEHOLDER | stereo camera R',(.134,-.11,1.411),(.035,.035,.035),board),
    ('PLACEHOLDER | microphone board',(0,-.102,1.327),(.03,.016,.014),board),
    ('PLACEHOLDER | speaker',(.189,.016,1.395),(.035,.057,.057),dark),
    ('PLACEHOLDER | battery low in base',(0,.025,.302),(.22,.18,.12),board),
    ('PLACEHOLDER | body motor controller',(0,.03,.56),(.105,.07,.03),board)]:
    o=box(name,loc,dims,m,pack,.003);o.display_type='WIRE';o['status']='Allowance only; no selected module dimensions or fit validation'
    if 'battery' not in name and 'body motor' not in name:parent_keep(o,roll)
pack.hide_render=True;pack.hide_viewport=True
scene.frame_start=1;scene.frame_end=120;scene.render.fps=24
# Editable expression study, without changing neutral design dimensions.
for frame,angles in [(1,(0,0,0)),(30,(-20,-8,-10)),(60,(20,12,10)),(90,(0,-10,0)),(120,(0,0,0))]:
    for o,axis,value in [(yaw,2,angles[0]),(pitch,0,angles[1]),(roll,1,angles[2])]:
        o.rotation_euler[axis]=math.radians(value);o.keyframe_insert(data_path='rotation_euler',frame=frame)
for side in [-1,1]:
    o=bpy.data.objects['Arm '+str(side)+' | shoulder X']
    for frame,deg in [(1,0),(30,-25 if side==1 else 0),(60,-40 if side==1 else -15),(90,0),(120,0)]:
        o.rotation_euler[0]=math.radians(deg);o.keyframe_insert(data_path='rotation_euler',frame=frame)
scene.frame_set(1)
print('HEAD_READY',len(head.objects),'head objects; yaw +/-90, nod/tilt study; neutral overall 1.524 m')
