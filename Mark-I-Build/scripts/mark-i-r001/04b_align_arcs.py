import bpy
for letter,offset,sx,sz in [('A',-.62,1,1),('B',0,.89,1.13),('C',.62,1.08,.90)]:
    for o in bpy.data.collections['MI CONCEPT '+letter+' | '+{'A':'EXPLORER','B':'SCOUT','C':'SURVEYOR'}[letter]].objects:
        if 'amber arc' in o.name:
            ex=-.134 if 'Eye -1' in o.name else .134
            o.location.x=offset+ex*(sx-1);o.location.z=.012*(sz-1)
print('Comparison arcs aligned to their camera eyes')
