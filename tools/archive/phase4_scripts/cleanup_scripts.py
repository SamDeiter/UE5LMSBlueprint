"""
Cleanup Script - Organize Python utility files
Moves historical fix scripts to archive, keeps active tools organized
"""

import shutil
from pathlib import Path

# Scripts to archive (historical/experimental)
ARCHIVE_SCRIPTS = [
    'add_debug_logging.py',
    'add_exec_container.py',
    'add_output_arrow_class.py',
    'add_pin_arrows.py',
    'check_html.py',
    'fix_arrow_directions.py',
    'fix_arrow_styling.py',
    'fix_arrows.py',
    'fix_arrows_detached.py',
    'fix_arrows_final.py',
    'fix_arrows_right_side.py',
    'fix_arrows_robust.py',
    'fix_css.py',
    'fix_css_files.py',
    'fix_exec_positioning.py',
    'fix_hollow_triangles.py',
    'fix_html_grid.py',
    'fix_input_arrow_right.py',
    'fix_node_js.py',
    'fix_nodes_css.py',
    'fix_output_arrow_left.py',
    'fix_output_arrows.py',
    'fix_pin_position.py',
    'fix_pin_size.py',
    'fix_set_node_layout.py',
    'flip_output_arrow.py',
    'integrate_pin_tests.py',
    'make_arrows_filled.py',
    'make_arrows_hollow.py',
    'refine_arrows_subtle.py',
    'remove_debug_logging.py',
    'remove_text_arrow.py',
    'update_arrow_states.py',
    'update_node_js.py',
]

# Utility scripts to keep in tools/active
ACTIVE_TOOLS = [
    'generate_nodes_css.py',
    'inspect_node.py',
]

# Current working scripts (stay in root)
CURRENT_SCRIPTS = [
    'standardize_node_appearance.py',
    'update_pin_rendering_guide.py',
]

def main():
    print("🧹 Starting Project Cleanup...")
    print()
    
    root = Path('.')
    archive_dir = Path('tools/archive')
    active_dir = Path('tools/active')
    
    # Ensure directories exist
    archive_dir.mkdir(parents=True, exist_ok=True)
    active_dir.mkdir(parents=True, exist_ok=True)
    
    moved_count = 0
    
    # Move archived scripts
    print(f"📦 Moving {len(ARCHIVE_SCRIPTS)} scripts to archive...")
    for script in ARCHIVE_SCRIPTS:
        src = root / script
        if src.exists():
            dst = archive_dir / script
            shutil.move(str(src), str(dst))
            print(f"  ✓ {script} → tools/archive/")
            moved_count += 1
        else:
            print(f"  ⊘ {script} (not found)")
    
    print()
    
    # Move active utility scripts
    print(f"🔧 Moving {len(ACTIVE_TOOLS)} utility scripts to active tools...")
    for script in ACTIVE_TOOLS:
        src = root / script
        if src.exists():
            dst = active_dir / script
            shutil.move(str(src), str(dst))
            print(f"  ✓ {script} → tools/active/")
            moved_count += 1
        else:
            print(f"  ⊘ {script} (not found)")
    
    print()
    
    # Report on current scripts
    print(f"📌 Current scripts remaining in root:")
    for script in CURRENT_SCRIPTS:
        src = root / script
        if src.exists():
            print(f"  ✓ {script}")
        else:
            print(f"  ⊘ {script} (not found)")
    
    print()
    print("=" * 60)
    print(f"✨ Cleanup Complete!")
    print(f"   Moved: {moved_count} files")
    print(f"   Archive: tools/archive/ ({len([f for f in ARCHIVE_SCRIPTS if (archive_dir / f).exists()])} files)")
    print(f"   Active: tools/active/ ({len([f for f in ACTIVE_TOOLS if (active_dir / f).exists()])} files)")
    print(f"   Root: {len([f for f in CURRENT_SCRIPTS if (root / f).exists()])} current scripts")
    print("=" * 60)
    print()
    print("Next steps:")
    print("  1. Review the cleaned-up root directory")
    print("  2. Check tools/archive/ for historical reference")
    print("  3. Use tools/active/ for utility scripts")
    print("  4. Continue with node standardization work")

if __name__ == '__main__':
    main()
