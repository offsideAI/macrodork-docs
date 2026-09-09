# Blender MCP integration for Mark-I

Prepared 2026-09-07 UTC. Update: the user completed setup and a live read-only MCP connection test passed. Scene information, protocol compatibility and viewport capture are verified; telemetry consent is off. See [connection results](logs/blender-mcp-connection-001.json). The steps below remain installation reference; no reinstall is needed for the tested connection.

## Design workflow

Use Blender for the complete 60-inch (1.524 m) robot's proportions, head/body shells, component-envelope assembly, articulation previews, materials and renders. Keep editable FreeCAD solids for dimensioned brackets, bearings, fasteners, neck mounts and fabrication exports. A Blender motion preview does not validate motor torque, stability, tolerances or battery runtime.

MCP should reduce the focus and mouse-position problems observed in the calibration session: the agent can inspect the scene and send modeling code directly to Blender. It does not supply mechanical engineering or a complete audit trail automatically. Continue saving scripts, results, screenshots and concise decision records under this folder.

Recommended integration: the third-party [ahujasid/blender-mcp project](https://github.com/ahujasid/blender-mcp). The checked [1.9.1 package](https://pypi.org/project/blender-mcp/1.9.1/) supports a bundled add-on installer. Repository HEAD observed during review: `c5f35d9cc54451d785ac4c00c48bf9e98a2e8db9`. The source revision and PyPI package are separately identified; their bytes have not been compared. Use the bundled add-on from the same package version as the server.

## Foreground operation

The connection is Codex → local MCP helper process → socket add-on in the open Blender application. Keep Blender on the LG UltraFine monitor during all modeling and rendering work. Commands update the scene directly; they do not replay a sequence of menu clicks. A long script may update the screen only when it completes, so use short, named batches and inspect each result.

MCP necessarily uses a helper process without a modeling window and a listener inside Blender. It does not require a headless Blender session. If the standing no-background rule excludes even that communication helper, retain the visible Python-console workflow instead. No helper has been started by this documentation task.

## 1. Keep the existing applications and prerequisites

Blender 5.2.1 LTS and FreeCAD 1.1.3 passed earlier calibration. Current read-only checks found:

- Codex: `/Users/coder/.local/bin/codex`; `codex mcp add --help` confirms command and environment-variable syntax.
- uv and uvx: version 0.11.14; uvx path `/Users/coder/.local/bin/uvx`.

No uv reinstall is needed. Blender MCP with this exact Blender build is not yet verified; the upstream prerequisite of Blender 3.0+ is not a compatibility test.

## 2. Install the matching add-on from a visible Terminal

Move Terminal onto LG and run:

```sh
DISABLE_TELEMETRY=true /Users/coder/.local/bin/uvx blender-mcp==1.9.1 install-addon
```

This downloads the package/dependencies if needed and copies its bundled add-on into Blender's user add-ons directory. Record the printed destination and version. The installer keeps a `.bak` when replacing an existing add-on. These application-support files live outside the repo; retain installation evidence here.

If the destination is unclear, inspect detected paths with:

```sh
DISABLE_TELEMETRY=true /Users/coder/.local/bin/uvx blender-mcp==1.9.1 addon-paths
```

Do not run another standalone `uvx blender-mcp` server; Codex will launch the transport process in step 5.

## 3. Enable the add-on visibly

In Blender on LG, open Edit → Preferences → Add-ons and search for **MCP for Blender**. Enable it. If it is absent, restart Blender after saving current work, or use the add-ons installation menu to select the file printed by the installer.

Expand the add-on preferences and uncheck **Allow Telemetry**. Leave optional asset libraries and external model-generation integrations disabled for the custom Mark-I geometry. The project's telemetry is enabled by default; the server environment setting below disables it as well. [Upstream telemetry instructions](https://github.com/ahujasid/blender-mcp#telemetry-control)

## 4. Start the Blender-side connection

In the 3D viewport, press N and open the **MCP for Blender** tab. Use the connection/start button. The inspected source calls it **Connect to MCP server**; parts of the README use **Start MCP Server** or **Connect to Claude**. The latter label does not require a Claude account.

Keep the local default host and port: `localhost:9876`. This is the add-on socket, not an HTTP MCP URL to paste into Codex. Save and use a separate test scene first.

## 5. Register the server with Codex

In the visible Terminal, run this once:

```sh
/Users/coder/.local/bin/codex mcp add blender \
  --env BLENDER_HOST=localhost \
  --env BLENDER_PORT=9876 \
  --env DISABLE_TELEMETRY=true \
  --env BLENDER_MCP_SAFE_MODE=1 \
  -- /Users/coder/.local/bin/uvx blender-mcp==1.9.1
```

Use the absolute uvx path because GUI clients may have a different PATH. Safe mode adds script validation; the upstream documentation says normal modeling, materials, saving, import/export and rendering remain supported. Treat it as an additional check, not a filesystem sandbox. If a script is rejected, inspect its reason and adapt the script.

Codex stores MCP configuration in `~/.codex/config.toml` by default. The file under `config/` linked below is a reviewable example, not an active configuration. Existing unrelated configuration must be preserved. [Official OpenAI MCP documentation](https://learn.chatgpt.com/docs/extend/mcp?surface=cli)

## 6. Reload and verify the connection

Restart the Codex client/server connection so its tool catalog reloads. Check configured servers:

```sh
/Users/coder/.local/bin/codex mcp list
```

In the Codex terminal UI, `/mcp` lists active servers. A configuration entry alone does not prove Blender connectivity. First request scene information and a viewport screenshot. Then, in a separate scene, create a named 20 mm cube, confirm dimensions of 0.020 m per axis, change its material and observe it on LG. Save the test scene under `blender/` with a fresh revision and capture evidence under `logs/`. Finish with a small visible render.

Only use one MCP client connection to this Blender instance. If the client cannot find uvx, recheck its absolute path. If it cannot connect to Blender, check the enabled add-on, connection button and port. Avoid rerunning geometry commands blindly after timeouts; inspect the scene first.

## 7. Begin the complete-body design

After the connection test passes, create a revisioned whole-robot blockout at 1.524 m overall: wheeled base, low battery envelope, torso, two single-joint gesture arms, three-axis neck and binocular head with Pi 5 8 GB envelope. Use the supplied mock as styling reference. Resolve the overall-height measurement convention for any top protrusions before freezing dimensions.

Develop the three head variants in that common body context, then refine the selected head and body appearance. Select real parts and derive mechanical interfaces in parallel with detailed styling. Keep unmeasured placeholders identified. Transfer engineering parts to FreeCAD and retain the verified millimetre-to-metre exchange convention.

Prepared configuration example: [blender-mcp.example.toml](config/blender-mcp.example.toml). Version pinning here fixes the top-level package; a fully reproducible environment also needs resolved dependency versions and hashes recorded during installation.
