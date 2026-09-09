"""Load in the visible FreeCAD console; call create_cube(), then export_and_check()."""
from datetime import datetime, timezone
import json
from pathlib import Path
import FreeCAD as App
import FreeCADGui as Gui
import Part
import Mesh

ROOT = Path('/Users/coder/repos/offsideai/githubrepos_workspace_active_1/macrodork-docs/Mark-I-Build')


def create_cube():
    if 'MarkI_Calibration' in App.listDocuments():
        raise RuntimeError('Calibration document already exists; inspect before repeating')
    doc = App.newDocument('MarkI_Calibration')
    cube = doc.addObject('Part::Box', 'CalibrationCube20mm')
    cube.Label = 'Calibration cube — 20 x 20 x 20 mm'
    cube.Length = cube.Width = cube.Height = 20
    doc.recompute()
    cube.ViewObject.ShapeColor = (0.12, 0.62, 0.56)
    Gui.activeDocument().activeView().viewAxonometric()
    Gui.activeDocument().activeView().fitAll()
    Gui.Selection.clearSelection()
    Gui.Selection.addSelection(cube)
    assert cube.Shape.isValid()
    assert abs(cube.Shape.Volume - 8000.0) < 1e-6
    print('PASS: cube 20 x 20 x 20 mm; valid solid; volume =', cube.Shape.Volume, 'mm^3')
    return cube


def export_and_check():
    doc = App.getDocument('MarkI_Calibration')
    cube = doc.getObject('CalibrationCube20mm')
    for folder in ('cad', 'exports', 'logs'):
        (ROOT / folder).mkdir(exist_ok=True)
    native = ROOT / 'cad/calibration-20mm-r001.FCStd'
    step = ROOT / 'exports/calibration-20mm-r001.step'
    stl = ROOT / 'exports/calibration-20mm-r001.stl'
    if any(path.exists() for path in (native, step, stl)):
        raise RuntimeError('Calibration outputs already exist; do not overwrite without review')
    doc.saveAs(str(native))
    Part.export([cube], str(step))
    Mesh.export([cube], str(stl))
    roundtrip = Part.Shape()
    roundtrip.read(str(step))
    assert roundtrip.isValid()
    assert abs(roundtrip.Volume - 8000.0) < 1e-6
    mesh = Mesh.Mesh(str(stl))
    dims = [mesh.BoundBox.XLength, mesh.BoundBox.YLength, mesh.BoundBox.ZLength]
    assert all(abs(value - 20) < 1e-5 for value in dims)
    record = {
        'recorded_at_utc': datetime.now(timezone.utc).isoformat(),
        'freecad_version': App.Version(), 'mode': 'visible FreeCAD GUI console',
        'cube_mm': [20, 20, 20], 'volume_mm3': cube.Shape.Volume,
        'step_reimport_valid': roundtrip.isValid(), 'step_reimport_volume_mm3': roundtrip.Volume,
        'stl_reimport_dimensions_mm': dims, 'stl_facets': mesh.CountFacets,
        'outputs': [str(path.relative_to(ROOT)) for path in (native, step, stl)],
        'status': 'pass'
    }
    (ROOT / 'logs/freecad-calibration-003.json').write_text(json.dumps(record, indent=2) + '\n')
    print('PASS: saved FCStd; STEP reimport = 8000 mm^3; STL reimport =', dims, 'mm')
    print('Files:', native.name, step.name, stl.name)


print('Calibration helper loaded. Run create_cube(), inspect it, then export_and_check().')
