"""
Safe Console.log Cleanup Script v2
Uses a more careful line-by-line approach that only removes complete single-line console.log statements.
"""
import re
from pathlib import Path

SRC_DIR = Path(r"c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src")

# Production files to clean (excludes test files)
PRODUCTION_FILES = [
    "ui/ParentClassModal.js",
    "ui/LayoutController.js",
    "ui/GraphsController.js",
    "ui/ComponentsController.js",
    "ui/VariableController.js",
    "services/Persistence.js",
    "services/ScormClient.js",
    "services/TaskManager.js",
    "services/executors/TimerExecutor.js",
    "services/executors/NeedNodeExecutor.js",
    "graph/WiringController.js",
    "graph/GraphInteraction.js",
    "app.js",
]

# Pattern for COMPLETE single-line console.log statements
# Matches: console.log(...); on a single line
CONSOLE_LOG_PATTERN = re.compile(r'^(\s*)console\.log\([^)]*\);\s*$')


def process_file(filepath):
    """Process a single file, removing only complete single-line console.logs."""
    try:
        content = filepath.read_text(encoding='utf-8')
        lines = content.split('\n')
        new_lines = []
        removed = 0
        
        for line in lines:
            if CONSOLE_LOG_PATTERN.match(line):
                removed += 1
                # Skip this line
            else:
                new_lines.append(line)
        
        if removed > 0:
            new_content = '\n'.join(new_lines)
            filepath.write_text(new_content, encoding='utf-8')
            print(f"  ✓ {filepath.name}: Removed {removed} console.log(s)")
            return removed
        else:
            print(f"  - {filepath.name}: No changes needed")
            return 0
    except Exception as e:
        print(f"  ✗ {filepath.name}: Error - {e}")
        return 0


def main():
    print("Safe Console.log Cleanup Script v2")
    print("=" * 40)
    print("(Only removes complete single-line statements)\n")
    
    total_removed = 0
    files_modified = 0
    
    for rel_path in PRODUCTION_FILES:
        filepath = SRC_DIR / rel_path
        if filepath.exists():
            removed = process_file(filepath)
            if removed > 0:
                total_removed += removed
                files_modified += 1
        else:
            print(f"  ? {rel_path}: File not found")
    
    print("\n" + "=" * 40)
    print(f"DONE: Removed {total_removed} console.log(s) from {files_modified} files")
    print("\nNext: Run 'npm run lint' to verify no syntax errors")


if __name__ == "__main__":
    main()
