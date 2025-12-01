"""
Final Cleanup Script
Moves ALL remaining temporary Python scripts to the archive directory.
"""

import os
import shutil

PROJECT_ROOT = r"c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main"
ARCHIVE_DIR = os.path.join(PROJECT_ROOT, "tools", "archive", "phase4_scripts")

# List of specific files we know we want to move based on the list_dir output
SCRIPTS_TO_MOVE = [
    "cleanup_phase4.py",
    "cleanup_scripts.py",
    "standardize_node_appearance.py",
    "update_css_phase1.py",
    "update_css_phase2.py",
    "update_js_phase3.py",
    "update_pin_rendering_guide.py"
]

def final_cleanup():
    print(f"Moving remaining scripts to {ARCHIVE_DIR}...")
    
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
    final_cleanup()
