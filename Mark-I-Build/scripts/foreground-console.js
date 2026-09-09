// Type a single visible console command into the named, already-frontmost app.
ObjC.import('Foundation');
function run(args) {
    if (args.length !== 2 || ['FreeCAD', 'Blender'].indexOf(args[0]) < 0) {
        throw new Error('Expected FreeCAD or Blender and one visible console command');
    }
    var events = Application('System Events');
    var process = events.processes.byName(args[0]);
    if (!process.frontmost()) throw new Error('Requested app is not frontmost');
    events.keystroke(args[1]);
    $.NSThread.sleepForTimeInterval(0.4);
    events.keyCode(36);
    $.NSThread.sleepForTimeInterval(1);
    return 'Entered visibly in ' + args[0] + ': ' + args[1];
}
