#!/usr/bin/env python3
"""Record local setup evidence without installing applications or changing settings."""

import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import platform
import plistlib
import shutil
import subprocess
import sys


def command_info(argv):
    try:
        result = subprocess.run(argv, capture_output=True, text=True, timeout=30)
        return {"command": argv, "exit_code": result.returncode,
                "stdout": result.stdout.strip(), "stderr": result.stderr.strip()}
    except (OSError, subprocess.TimeoutExpired) as exc:
        return {"command": argv, "error": str(exc)}


def app_info(path):
    bundle = Path(path).expanduser().resolve()
    info = {"bundle": str(bundle), "present": bundle.is_dir()}
    if not info["present"]:
        return info
    try:
        with (bundle / "Contents/Info.plist").open("rb") as handle:
            metadata = plistlib.load(handle)
        info["version"] = metadata.get("CFBundleShortVersionString")
        info["build"] = metadata.get("CFBundleVersion")
        executable = metadata.get("CFBundleExecutable")
        if executable:
            binary = bundle / "Contents/MacOS" / executable
            info["executable"] = str(binary)
            info["executable_present"] = binary.is_file()
    except (OSError, plistlib.InvalidFileException, ValueError) as exc:
        info["error"] = str(exc)
    return info


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--blender-app", default="/Applications/Blender.app")
    parser.add_argument("--freecad-app", default="/Applications/FreeCAD.app")
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    now = datetime.now(timezone.utc)
    apps = {"blender": app_info(args.blender_app), "freecad": app_info(args.freecad_app)}
    blender = apps["blender"]
    if blender.get("executable_present"):
        blender["version_check"] = command_info([blender["executable"], "--version"])
    missing = [name for name, info in apps.items() if not info.get("executable_present")]
    report = {
        "recorded_at_utc": now.isoformat(),
        "machine": platform.machine(),
        "macos_version": platform.mac_ver()[0],
        "python": sys.version,
        "python_executable": sys.executable,
        "commands": {name: shutil.which(name) for name in ("brew", "git", "python3", "blender", "FreeCAD")},
        "apps": apps,
        "missing_core_apps": missing,
        "status": "missing_core_apps" if missing else "installed_pending_functional_checks",
        "limits": "Inventory only; FreeCAD geometry, Blender Python, rendering and exchange checks are separate.",
    }
    output = root / "logs" / ("toolchain-" + now.strftime("%Y%m%dT%H%M%S.%fZ") + ".json")
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("x", encoding="utf-8") as handle:
        json.dump(report, handle, indent=2)
        handle.write("\n")
    print(output)
    print(report["status"])
    if missing:
        print("Not found at configured bundle paths: " + ", ".join(missing))
    return 1 if missing else 0


if __name__ == "__main__":
    raise SystemExit(main())
