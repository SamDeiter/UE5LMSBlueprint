import os
import shutil

docs_dir = 'docs'

# Files to delete (outdated/redundant)
files_to_delete = [
    'archived/BULLETPROOF_GHOST_WIRE.md',
    'archived/FIX_CORRUPTION.md',
    'archived/FIX_SYNTAX_ERROR.md',
    'archived/GHOST_WIRE_DEBUG.md',
    'archived/GHOST_WIRE_FIX.md',
    'archived/KEEP_WIRE_VISIBLE.md',
    'archived/MANUAL_REFACTORING_STEPS.md',
    'archived/NODE_ORGANIZATION.md',
    'archived/PHASE_4_CLEANUP_GUIDE.md',
    'archived/icons_list.txt',
    'status/PHASE1_COMPLETE.md',
    'status/PHASE1_PROPERTIES_STATUS.md',
    'status/PHASE1_STATUS.md',
    'status/REFACTORING_STATUS.md',
    'status/SESSION_SUMMARY.md',
    'planning/FUNCTION_MACRO_PLAN.md',  # Duplicate of FUNCTIONS_MACROS_INTERFACES_PLAN
    'planning/PLAN_VALIDATION_AND_TESTING.md',  # Redundant with TESTING_PLAN
    'planning/VISUAL_IMPROVEMENT_PLAN.md',  # Outdated
    'testing/TESTING_REPORT.md',  # Outdated
]

# Delete files
for file_path in files_to_delete:
    full_path = os.path.join(docs_dir, file_path)
    if os.path.exists(full_path):
        os.remove(full_path)
        print(f"Deleted: {file_path}")

# Remove empty archived directory
archived_dir = os.path.join(docs_dir, 'archived')
if os.path.exists(archived_dir) and not os.listdir(archived_dir):
    os.rmdir(archived_dir)
    print("Removed empty 'archived' directory")

# Remove empty status directory if it becomes empty
status_dir = os.path.join(docs_dir, 'status')
if os.path.exists(status_dir) and not os.listdir(status_dir):
    os.rmdir(status_dir)
    print("Removed empty 'status' directory")

print("\nCleanup complete!")
