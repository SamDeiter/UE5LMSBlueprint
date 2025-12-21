"""
Move Python scripts from root folder to tools/archive/
Tech Debt Cleanup - December 2024
"""
import os
import shutil

# Define paths
ROOT_DIR = r"C:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint"
ARCHIVE_DIR = os.path.join(ROOT_DIR, "tools", "archive")

# Scripts to move (all historical fix scripts in root)
SCRIPTS_TO_ARCHIVE = [
    "add_class_settings.py",
    "add_debugging_parity.py",
    "add_event_dispatcher.py",
    "add_keyboard_chords.py",
    "add_reference_pin.py",
    "add_timer_nodes.py",
    "convert_inline_styles.py",
    "fix_alignment.py",
    "fix_block_layout.py",
    "fix_grid_layout.py",
    "fix_label_display.py",
    "fix_simulation_engine.py",
    "fix_task_alignment.py",
    "restore_toolbar.py",
    "update_index_html.py",
    "update_node_definitions.py",
]

def main():
    print(f"Moving {len(SCRIPTS_TO_ARCHIVE)} scripts to archive...")
    print(f"Archive directory: {ARCHIVE_DIR}")
    print("-" * 50)
    
    moved = 0
    skipped = 0
    
    for script in SCRIPTS_TO_ARCHIVE:
        src = os.path.join(ROOT_DIR, script)
        dst = os.path.join(ARCHIVE_DIR, script)
        
        if not os.path.exists(src):
            print(f"SKIP: {script} (not found in root)")
            skipped += 1
            continue
            
        if os.path.exists(dst):
            print(f"SKIP: {script} (already exists in archive)")
            skipped += 1
            continue
        
        shutil.move(src, dst)
        print(f"MOVED: {script}")
        moved += 1
    
    print("-" * 50)
    print(f"Complete! Moved: {moved}, Skipped: {skipped}")
    
    # Verify root is clean
    remaining = [f for f in os.listdir(ROOT_DIR) if f.endswith('.py')]
    if remaining:
        print(f"\nWARNING: {len(remaining)} Python files still in root:")
        for f in remaining:
            print(f"  - {f}")
    else:
        print("\n✓ Root folder is clean of Python scripts!")

if __name__ == "__main__":
    main()
