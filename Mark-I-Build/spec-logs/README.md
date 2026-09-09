  $ osascript -l JavaScript -e 'ObjC.import("AppKit"); var screens = $.NSScreen.screens; var result = []; for (var i = 0; i < screens.count; i++) { var screen =
  screens.objectAtIndex(i); var f = screen.frame; var v = screen.visibleFrame;
  result.push({index:i,name:ObjC.unwrap(screen.localizedName),frame:{x:f.origin.x,y:f.origin.y,width:f.size.width,height:f.size.height},visibleFrame:{x:v.origin.x,y:v.origin.
  y,width:v.size.width,height:v.size.height}}); } JSON.stringify(result);'
