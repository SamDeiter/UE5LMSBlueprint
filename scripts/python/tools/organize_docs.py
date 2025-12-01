import os
import shutil

docs_dir = 'docs'

# Create subdirectories
subdirs = {
    'planning': [],
    'guides': [],
    'testing': [],
    'status': [],
    'archived': []
}

# Categorize files
file_categories = {
    'planning': [
        'ADVANCED_FEATURES_TEST_PLAN.md',
        'CODE_QUALITY_PLAN.md',
        'COMPONENT_SYSTEM_PLAN.md',
        'DEBUG_AND_TICK_PLAN.md',
        'FEATURE_PLANNING.md',
        'FUNCTIONS_MACROS_INTERFACES_PLAN.md',
        'FUNCTION_MACRO_PLAN.md',
        'NEED_NODE_VALIDATION_PLAN.md',
        'NODE_IMPLEMENTATION_PLAN.md',
        'PLAN_VALIDATION_AND_TESTING.md',
        'REFACTORING_PLAN.md',
        'TESTING_PLAN.md',
        'VISUAL_IMPROVEMENT_PLAN.md',
        'implementation_plan_components.md',
        'NEXT_STEPS_PLAN.md'
    ],
    'guides': [
        'ASSESSMENT_SYSTEM_SUMMARY.md',
        'BLUEPRINT_DEBUGGING_ASSESSMENT.md',
        'INSTRUCTOR_GUIDE.md',
        'MANUAL_TESTING_GUIDE.md',
        'NEED_NODE_USER_GUIDE.md',
        'TASK_GUIDE.md',
        'TASK_SYSTEM_GUIDE.md',
        'TESTING_QUICK_START.md',
        'README.md'
    ],
    'testing': [
        'PHASE1_TESTING_CHECKLIST.md',
        'TESTING.md',
        'TESTING_REPORT.md'
    ],
    'status': [
        'KNOWN_ISSUES.md',
        'KNOWN_LIMITATIONS.md',
        'NEXT_SESSION.md',
        'PHASE1_COMPLETE.md',
        'PHASE1_PROPERTIES_STATUS.md',
        'PHASE1_STATUS.md',
        'REFACTORING_STATUS.md',
        'SESSION_SUMMARY.md'
    ],
    'archived': [
        'BULLETPROOF_GHOST_WIRE.md',
        'FIX_CORRUPTION.md',
        'FIX_SYNTAX_ERROR.md',
        'GHOST_WIRE_DEBUG.md',
        'GHOST_WIRE_FIX.md',
        'KEEP_WIRE_VISIBLE.md',
        'MANUAL_REFACTORING_STEPS.md',
        'NODE_ORGANIZATION.md',
        'PHASE_4_CLEANUP_GUIDE.md',
        'icons_list.txt'
    ]
}

# Create subdirectories
for subdir in subdirs.keys():
    subdir_path = os.path.join(docs_dir, subdir)
    os.makedirs(subdir_path, exist_ok=True)
    print(f"Created directory: {subdir_path}")

# Move files
for category, files in file_categories.items():
    for filename in files:
        src = os.path.join(docs_dir, filename)
        dst = os.path.join(docs_dir, category, filename)
        if os.path.exists(src):
            shutil.move(src, dst)
            print(f"Moved {filename} to {category}/")
        else:
            print(f"File not found: {filename}")

print("\nDocs folder organized!")
