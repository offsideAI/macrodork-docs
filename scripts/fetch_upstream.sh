#!/usr/bin/env bash
# Fetch the upstream repositories. This repo does not re-host upstream code; it only
# holds generated results and scripts.
set -e
mkdir -p upstream && cd upstream

# Upstream reinforcement-learning training stack - the MJCF model and the 47 STL files live here
[ -d microduck_rl ] || git clone --depth 1 https://github.com/pollen-robotics/microduck_rl.git

# Upstream on-board runtime (Rust, bound to the Rockchip RK3566)
[ -d microduck ] || git clone --depth 1 https://github.com/pollen-robotics/microduck.git

# RPI Robot HAT board - official open-source KiCad project and production files (Gerber / BOM / pick-and-place)
[ -d elec_RPI_Robot_HAT ] || git clone --depth 1 https://github.com/pollen-robotics/elec_RPI_Robot_HAT.git

cd ..
echo ""
echo "Done. Build the printable-parts tree, then regenerate the drawings and CAD assembly with:"
echo "  python scripts/build_print_tree.py"
echo "  python scripts/render_assembly.py upstream/microduck_rl assembly-drawings"
echo "  python scripts/export_assembly_stl.py upstream/microduck_rl cad"
