"""
Dead Code Detection Script
Finds unused exports, imports, and files in the JavaScript codebase
"""
import os
import re
from pathlib import Path
from collections import defaultdict

def find_js_files(directory):
    """Find all JavaScript files excluding node_modules"""
    js_files = []
    for file in Path(directory).rglob('*.js'):
        if 'node_modules' not in str(file):
            js_files.append(file)
    return js_files

def extract_exports(content, file_path):
    """Extract all exports from file content"""
    exports = set()
    
    # export { Foo, Bar }
    for match in re.finditer(r'export\s*\{([^}]+)\}', content):
        items = match.group(1).split(',')
        for item in items:
            # Handle "Foo as Bar" syntax
            name = item.split(' as ')[0].strip()
            exports.add(name)
    
    # export function/class/const/let/var Foo
    for match in re.finditer(r'export\s+(?:function|class|const|let|var)\s+(\w+)', content):
        exports.add(match.group(1))
    
    # export default Foo
    for match in re.finditer(r'export\s+default\s+(\w+)', content):
        exports.add(f'default:{match.group(1)}')
    
    return exports

def extract_imports(content):
    """Extract all imported names from file content"""
    imports = set()
    
    # import { Foo, Bar } from './file'
    for match in re.finditer(r'import\s*\{([^}]+)\}\s*from', content):
        items = match.group(1).split(',')
        for item in items:
            # Handle "Foo as Bar" syntax - we care about the original name
            name = item.split(' as ')[0].strip()
            imports.add(name)
    
    # import Foo from './file'
    for match in re.finditer(r'import\s+(\w+)\s+from', content):
        imports.add(match.group(1))
    
    # import * as Foo from './file'
    for match in re.finditer(r'import\s+\*\s+as\s+(\w+)\s+from', content):
        imports.add(match.group(1))
    
    return imports

def extract_imported_files(content, current_file):
    """Extract all imported file paths"""
    imported = set()
    
    for match in re.finditer(r'from\s+["\']([^"\']+)["\']', content):
        import_path = match.group(1)
        
        # Resolve relative imports
        if import_path.startswith('.'):
            # Remove query parameters (e.g., ?v=4)
            import_path = import_path.split('?')[0]
            
            # Add .js if not present
            if not import_path.endswith('.js'):
                import_path += '.js'
            
            # Resolve relative to current file
            resolved = (current_file.parent / import_path).resolve()
            imported.add(str(resolved))
    
    return imported

def analyze_codebase(src_dir):
    """Analyze entire codebase for dead code"""
    files = find_js_files(src_dir)
    
    all_exports = defaultdict(set)
    all_imports = set()
    all_imported_files = set()
    file_contents = {}
    
    print(f"Analyzing {len(files)} JavaScript files...")
    
    for file in files:
        try:
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            file_contents[str(file)] = content
            
            # Extract exports
            exports = extract_exports(content, file)
            if exports:
                all_exports[str(file)] = exports
            
            # Extract imports
            imports = extract_imports(content)
            all_imports.update(imports)
            
            # Extract imported files
            imported_files = extract_imported_files(content, file)
            all_imported_files.update(imported_files)
            
        except Exception as e:
            print(f"Error processing {file}: {e}")
    
    return all_exports, all_imports, all_imported_files, file_contents, files

def find_unused_exports(all_exports, all_imports):
    """Find exports that are never imported"""
    unused = defaultdict(list)
    
    for file, exports in all_exports.items():
        for export in exports:
            # Skip default exports (harder to track)
            if export.startswith('default:'):
                continue
            
            if export not in all_imports:
                unused[file].append(export)
    
    return unused

def find_unused_files(files, all_imported_files):
    """Find files that are never imported"""
    # Entry points that don't need to be imported
    entry_points = {
        'app.js', 'ui.js', 'services.js', 'tests.js',
        'index.js'  # Aggregator files
    }
    
    # Test files don't need to be imported
    test_files = {'test.js', '.test.js'}
    
    unused = []
    for file in files:
        file_str = str(file)
        file_name = file.name
        
        # Skip entry points
        if file_name in entry_points:
            continue
        
        # Skip test files
        if any(test in file_name for test in test_files):
            continue
        
        # Check if file is imported
        if file_str not in all_imported_files:
            unused.append(file_str)
    
    return unused

def generate_report(src_dir):
    """Generate comprehensive dead code report"""
    all_exports, all_imports, all_imported_files, file_contents, files = analyze_codebase(src_dir)
    
    unused_exports = find_unused_exports(all_exports, all_imports)
    unused_files = find_unused_files(files, all_imported_files)
    
    # Generate report
    report = []
    report.append("=" * 80)
    report.append("DEAD CODE DETECTION REPORT")
    report.append("=" * 80)
    report.append("")
    
    # Summary
    report.append(f"Total files analyzed: {len(files)}")
    report.append(f"Files with exports: {len(all_exports)}")
    report.append(f"Total unique imports: {len(all_imports)}")
    report.append(f"Files with unused exports: {len(unused_exports)}")
    report.append(f"Potentially unused files: {len(unused_files)}")
    report.append("")
    
    # Unused exports
    if unused_exports:
        report.append("=" * 80)
        report.append("UNUSED EXPORTS")
        report.append("=" * 80)
        report.append("")
        
        for file, exports in sorted(unused_exports.items()):
            # Make path relative to src
            rel_path = file.replace(str(Path(src_dir).resolve()), 'src')
            report.append(f"{rel_path}:")
            for export in sorted(exports):
                report.append(f"  - {export}")
            report.append("")
    else:
        report.append("✅ No unused exports found!")
        report.append("")
    
    # Unused files
    if unused_files:
        report.append("=" * 80)
        report.append("POTENTIALLY UNUSED FILES")
        report.append("=" * 80)
        report.append("")
        report.append("(Note: These files are not imported. Verify before deleting!)")
        report.append("")
        
        for file in sorted(unused_files):
            rel_path = file.replace(str(Path(src_dir).resolve()), 'src')
            report.append(f"  - {rel_path}")
        report.append("")
    else:
        report.append("✅ No unused files found!")
        report.append("")
    
    report.append("=" * 80)
    
    return '\n'.join(report)

if __name__ == '__main__':
    src_dir = 'src'
    report = generate_report(src_dir)
    
    # Print to console
    print(report)
    
    # Save to file
    with open('audit-reports/DEAD_CODE_REPORT.txt', 'w', encoding='utf-8') as f:
        f.write(report)
    
    print("\n✅ Report saved to audit-reports/DEAD_CODE_REPORT.txt")
