#!/usr/bin/env python3
"""
Test Runner Utility
Executes tests and returns a concise summary.
"""

import subprocess
import sys
from pathlib import Path


def run_node_tests(project_root: Path) -> dict:
    """Run Node.js tests and capture output."""
    try:
        result = subprocess.run(
            ['node', 'tests.js'],
            cwd=project_root,
            capture_output=True,
            text=True,
            timeout=30
        )
        
        return {
            'success': result.returncode == 0,
            'stdout': result.stdout,
            'stderr': result.stderr,
            'returncode': result.returncode
        }
    except subprocess.TimeoutExpired:
        return {
            'success': False,
            'stdout': '',
            'stderr': 'Test execution timed out after 30 seconds',
            'returncode': -1
        }
    except Exception as e:
        return {
            'success': False,
            'stdout': '',
            'stderr': str(e),
            'returncode': -1
        }


def parse_test_output(output: str) -> dict:
    """Parse test output to extract pass/fail counts."""
    lines = output.split('\n')
    
    passed = 0
    failed = 0
    
    for line in lines:
        if '✓' in line or 'PASS' in line:
            passed += 1
        elif '✗' in line or 'FAIL' in line:
            failed += 1
    
    return {
        'passed': passed,
        'failed': failed,
        'total': passed + failed
    }


def main():
    project_root = Path(__file__).parent.parent
    
    print("🧪 Running tests...")
    print("="*60)
    
    result = run_node_tests(project_root)
    
    if result['success']:
        print("✅ Tests passed!")
        print(result['stdout'])
    else:
        print("❌ Tests failed!")
        print(result['stdout'])
        if result['stderr']:
            print("\nErrors:")
            print(result['stderr'])
    
    # Parse and summarize
    stats = parse_test_output(result['stdout'])
    
    print("\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)
    print(f"✔ Passed: {stats['passed']}")
    print(f"✗ Failed: {stats['failed']}")
    print(f"📝 Total:  {stats['total']}")
    
    sys.exit(0 if result['success'] else 1)


if __name__ == '__main__':
    main()
