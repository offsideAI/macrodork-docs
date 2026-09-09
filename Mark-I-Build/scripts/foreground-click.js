// Visible mouse input only; no Blender Python, settings-file edits, or headless apps.
ObjC.import('CoreGraphics');
ObjC.import('Foundation');
function run(args) {
    if (args.length !== 2 && args.length !== 3) throw new Error('Supply global screen x and y, optionally FreeCAD or Blender');
    var expected = args[2] || 'Blender';
    if (['Blender', 'FreeCAD'].indexOf(expected) < 0) throw new Error('Expected Blender or FreeCAD');
    if (!Application('System Events').processes.byName(expected).frontmost()) {
        throw new Error('Expected app is not frontmost; inspect the screen before retrying');
    }
    var x = Number(args[0]), y = Number(args[1]);
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < 2056 || x >= 4616 || y < 0 || y >= 1440) {
        throw new Error('Click must be on the observed LG UltraFine display');
    }
    var point = $.CGPointMake(x, y);
    $.CGEventPost($.kCGHIDEventTap, $.CGEventCreateMouseEvent(null, $.kCGEventMouseMoved, point, $.kCGMouseButtonLeft));
    $.NSThread.sleepForTimeInterval(0.2);
    $.CGEventPost($.kCGHIDEventTap, $.CGEventCreateMouseEvent(null, $.kCGEventLeftMouseDown, point, $.kCGMouseButtonLeft));
    $.NSThread.sleepForTimeInterval(0.15);
    $.CGEventPost($.kCGHIDEventTap, $.CGEventCreateMouseEvent(null, $.kCGEventLeftMouseUp, point, $.kCGMouseButtonLeft));
    $.NSThread.sleepForTimeInterval(0.5);
    return 'Visible click at ' + x + ', ' + y;
}
