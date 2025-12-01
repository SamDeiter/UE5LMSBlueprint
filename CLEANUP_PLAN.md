# Project Cleanup Plan

## Current Issue
The root directory has **38 Python scripts** from various fix attempts, making it cluttered and hard to navigate.

## Proposed Organization

### Keep in Root (Active Scripts)
- `standardize_node_appearance.py` - Main CSS standardization script
- `update_pin_rendering_guide.py` - JavaScript update guide

### Move to `tools/archive/` (Historical Fix Scripts)
All the incremental fix scripts that were experimental or superseded:
- `add_debug_logging.py`
- `add_exec_container.py`
- `add_output_arrow_class.py`
- `add_pin_arrows.py`
- `check_html.py`
- `fix_arrow_directions.py`
- `fix_arrow_styling.py`
- `fix_arrows.py`
- `fix_arrows_detached.py`
- `fix_arrows_final.py`
- `fix_arrows_right_side.py`
- `fix_arrows_robust.py`
- `fix_css.py`
- `fix_css_files.py`
- `fix_exec_positioning.py`
- `fix_hollow_triangles.py`
- `fix_html_grid.py`
- `fix_input_arrow_right.py`
- `fix_node_js.py`
- `fix_nodes_css.py`
- `fix_output_arrow_left.py`
- `fix_output_arrows.py`
- `fix_pin_position.py`
- `fix_pin_size.py`
- `fix_set_node_layout.py`
- `flip_output_arrow.py`
- `integrate_pin_tests.py`
- `make_arrows_filled.py`
- `make_arrows_hollow.py`
- `refine_arrows_subtle.py`
- `remove_debug_logging.py`
- `remove_text_arrow.py`
- `update_arrow_states.py`
- `update_node_js.py`

### Keep as Utility (Move to `tools/active/`)
- `generate_nodes_css.py` - Might be useful for regenerating CSS
- `inspect_node.py` - Debugging utility

## Cleanup Actions
1. ✅ Create `tools/archive/` directory
2. ✅ Create `tools/active/` directory
3. Move 34 historical scripts to archive
4. Move 2 utility scripts to active
5. Keep 2 current scripts in root
6. Update documentation

## Benefits
- ✨ Cleaner root directory
- 📁 Better organization
- 🔍 Easier to find current tools
- 📚 Historical scripts preserved for reference
