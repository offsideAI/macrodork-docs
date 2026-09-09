assert not bpy.app.background, 'Visible Blender required'
assert bpy.data.scenes.get('MarkI_R001') is None, 'Scene exists; do not repeat'
scene=bpy.data.scenes.new('MarkI_R001');bpy.context.window.scene=scene
scene.unit_settings.system='METRIC';scene.unit_settings.scale_length=1;scene.unit_settings.length_unit='MILLIMETERS'
scene['concept_only']=True;scene['neutral_overall_height_m']=1.524
scene['source_reference']='Mark-I-Build/specification-mocks/mock_1.png'
scene['provenance']='Original concept geometry; not measured or imported Asimov CAD'
base=collection('MI 01 | mobile base');body=collection('MI 02 | torso');arms=collection('MI 03 | gesture arms');rig=collection('MI 00 | articulation')
box('Base | lower impact bumper',(0,0,.25),(.54,.47,.115),dark,base,.05)
box('Base | upper deck',(0,0,.318),(.49,.43,.07),silver,base,.03)
box('Base | central battery housing',(0,.01,.36),(.31,.33,.11),dark,base,.035)
for side in [-1,1]:
    x=side*.278
    cyl('Drive tire '+str(side),(x,.065,.165),.165,.10,rubber,base,'X',.014)
    for face in [-1,1]:
        xx=x+face*.049
        torus('Tire shoulder bead',(xx,.065,.165),.139,.009,rubber,base,'X')
    cyl('Drive wheel alloy hub '+str(side),(x+side*.052,.065,.165),.119,.015,silver,base,'X',.006)
    cyl('Drive hub inset',(x+side*.062,.065,.165),.077,.006,dark,base,'X')
    cyl('Drive hub cap',(x+side*.067,.065,.165),.058,.008,light_silver,base,'X')
    for j in range(6):
        a=2*pi*j/6
        cyl('Hub fastener',(x+side*.064,.065+.097*cos(a),.165+.097*sin(a)),.005,.003,dark,base,'X',.001,16)
    for j in range(40):
        a=2*pi*j/40
        o=box('Drive tread block',(x,.065+.162*cos(a),.165+.162*sin(a)),(.079,.011,.003),rubber,base,.001)
        o.rotation_euler[0]=a-pi/2
    # Passive front support casters; styling placeholder, not a selected product.
    cx=side*.195;cy=-.205
    cyl('Front caster tire',(cx,cy,.10),.10,.073,rubber,base,'X',.012)
    cyl('Front caster hub',(cx+side*.038,cy,.10),.073,.008,silver,base,'X',.004)
    cyl('Front caster centre',(cx+side*.044,cy,.10),.04,.006,dark,base,'X')
    box('Caster fork',(cx,cy,.205),(.10,.075,.072),silver,base,.023)
    cyl('Caster swivel',(cx,cy,.25),.043,.045,dark,base)
    box('Caster accent recess',(cx,cy-.041,.205),(.022,.008,.052),black,base,.005)
    box('Caster amber marker',(cx,cy-.046,.205),(.006,.003,.034),amber,base,.002)
# Exposed central waist and curved torso, separated by a service seam.
cyl('Waist structural column',(0,0,.418),.115,.105,dark,body)
torus('Waist seal',(0,0,.443),.12,.012,black,body)
shell_profile('Torso | lower service shell',[(.415,.105,.103),(.43,.135,.115),(.48,.157,.129),(.56,.177,.144),(.615,.19,.153),(.623,.191,.154)],silver,body)
shell_profile('Torso | main shell',[(.63,.192,.155),(.638,.194,.157),(.73,.207,.169),(.87,.222,.171),(1.01,.214,.16),(1.105,.183,.143),(1.143,.148,.125),(1.15,.125,.11)],silver,body)
# Front recessed identity badge and visible status indicator.
box('Torso | identity recess',(0,-.171,.995),(.142,.019,.056),dark,body,.011)
label('MARK-I wordmark','MARK-I',(0,-.182,1.001),.023,light_silver,body)
label('Unit designation','COMPANION / 01',(0,-.182,.982),.007,light_silver,body)
box('Torso | status recess',(0,-.175,.925),(.081,.009,.012),black,body,.004)
box('Torso | amber status',(0,-.181,.925),(.048,.004,.0035),amber,body,.0015)
# Rear service hatch and vent bank.
box('Torso | rear service hatch',(0,.168,.815),(.21,.019,.26),dark,body,.022)
box('Torso | rear hatch panel',(0,.181,.815),(.196,.012,.245),silver,body,.021)
for i in range(7):box('Torso | rear cooling slot',(0,.19,.84+i*.012),(.124,.005,.004),black,body,.0018)
for x in [-.078,.078]:
    for z in [.723,.908]:cyl('Rear captive screw',(x,.192,z),.0035,.002,dark,body,'Y',.0005,16)
# One rigid arm and one shoulder axis each; no implied elbow actuator.
for side in [-1,1]:
    pivot=empty('Arm '+str(side)+' | shoulder X', (side*.218,0,1.035),rig)
    pivot['powered_axes']=1;pivot['motion']='Raise/lower rigid gesture arm'
    pieces=[]
    pieces.append(cyl('Shoulder rubber gaiter',(side*.218,0,1.035),.086,.052,dark,arms,'X'))
    pieces.append(cyl('Shoulder silver cap',(side*.257,0,1.035),.071,.037,silver,arms,'X',.009))
    pieces.append(cyl('Shoulder centre',(side*.28,0,1.035),.044,.009,dark,arms,'X'))
    pieces.append(torus('Shoulder trim',(side*.286,0,1.035),.046,.003,light_silver,arms,'X'))
    pieces.append(box('Arm '+str(side)+' | single-piece paddle',(side*.268,.007,.84),(.105,.119,.342),silver,arms,.049))
    pieces.append(box('Arm '+str(side)+' | soft end',(side*.268,-.001,.68),(.102,.115,.068),dark,arms,.031))
    pieces.append(box('Arm '+str(side)+' | outer trim',(side*.324,-.005,.86),(.006,.064,.13),dark,arms,.002))
    for o in pieces:parent_keep(o,pivot)
    limit=pivot.constraints.new('LIMIT_ROTATION');limit.use_limit_x=True;limit.min_x=-pi/3;limit.max_x=pi/3;limit.owner_space='LOCAL'
    pivot['limits_are_provisional']=True
# Focus viewport on the new robot body.
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type=='VIEW_3D':
            space=area.spaces.active;space.clip_start=.001;space.clip_end=100
            space.region_3d.view_location=(0,0,.78);space.region_3d.view_distance=2.8
            space.shading.type='MATERIAL' if False else 'SOLID';space.shading.color_type='MATERIAL'
print('BODY_READY',len(scene.objects),'objects; neutral target 1.524 m; original scene preserved')
