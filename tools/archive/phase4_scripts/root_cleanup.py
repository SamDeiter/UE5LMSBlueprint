"""
Root Directory Cleanup
Moves documentation, plans, and reference files to appropriate subdirectories.
"""

import os
import shutil

PROJECT_ROOT = r"c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main"

MOVES = {
    "docs/plans": [
        "CLEANUP_COMPLETE.md",
        "CLEANUP_PLAN.md",
        "NODE_STANDARDIZATION_PLAN.md",
        "STANDARDIZATION_SUMMARY.md"
    ],
    "tests/references": [
        "reference_all_nodes.html",
        "reference_complete_nodes.html",
        "reference_event_tick.html",
        "reference_pin_states.html",
        "reference_selection_and_complete.html"
    ],
    "docs/standards": [
        "VISUAL_STYLE_GUIDE.md",
        "TESTING_CHECKLIST_VISUAL.md"
    ]
}

def clean_root():
    print("Cleaning root directory...")
    
    for dest_sub, files in MOVES.items():
        dest_dir = os.path.join(PROJECT_ROOT, dest_sub)
        if not os.path.exists(dest_dir):
            os.makedirs(dest_dir)
            
        for filename in files:
            src = os.path.join(PROJECT_ROOT, filename)
            dst = os.path.join(dest_dir, filename)
            
            if os.path.exists(src):
                try:
                    shutil.move(src, dst)
                    print(f"✅ Moved {filename} -> {dest_sub}/")
                except Exception as e:
                    print(f"❌ Error moving {filename}: {e}")
            else:
                print(f"⚠️  {filename} not found")

if __name__ == "__main__":
    clean_root()
