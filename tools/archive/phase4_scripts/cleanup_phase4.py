"""
Cleanup Script
Moves all temporary Phase 4 Python scripts to the archive directory.
"""

import os
import shutil

PROJECT_ROOT = r"c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main"
ARCHIVE_DIR = os.path.join(PROJECT_ROOT, "tools", "archive", "phase4_scripts")

SCRIPTS_TO_MOVE = [
    "update_css_correct.py",
    "update_js_correct.py",
    "update_css_widgets.py",
    "update_js_widgets.py",
    "update_js_widgets_v2.py",
    "update_js_input_arrows.py",
    "fix_input_arrow_pos.py",
    "update_get_node_polish.py",
    "update_set_node_polish.py",
    "update_transparency.py",
    "update_transparency_v2.py",
    "update_event_icon.py",
    "update_sizing.py",
    "update_theme.py",
    "fix_get_alignment.py",
    "fix_get_width.py",
    "polish_get_gloss.py"
]

def cleanup_scripts():
    print(f"Moving scripts to {ARCHIVE_DIR}...")
    
    if not os.path.exists(ARCHIVE_DIR):
        os.makedirs(ARCHIVE_DIR)
        
    for script in SCRIPTS_TO_MOVE:
        src = os.path.join(PROJECT_ROOT, script)
        dst = os.path.join(ARCHIVE_DIR, script)
        
        if os.path.exists(src):
            try:
                shutil.move(src, dst)
                print(f"✅ Moved {script}")
            except Exception as e:
                print(f"❌ Error moving {script}: {e}")
        else:
            print(f"⚠️  {script} not found (already moved?)")

if __name__ == "__main__":
    cleanup_scripts()
