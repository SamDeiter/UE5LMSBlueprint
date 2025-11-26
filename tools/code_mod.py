#!/usr/bin/env python3
"""
Code Modification Utility
Applies structured edits to JavaScript files based on JSON change descriptions.
"""

import json
import re
import sys
from pathlib import Path
from difflib import unified_diff
from typing import Dict, List, Tuple


class CodeModifier:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        
    def load_file(self, path: str) -> str:
        """Load file content."""
        full_path = self.project_root / path
        with open(full_path, 'r', encoding='utf-8') as f:
            return f.read()
    
    def save_file(self, path: str, content: str) -> None:
        """Save file content."""
        full_path = self.project_root / path
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
    
    def find_object_key(self, content: str, key: str) -> Tuple[int, int]:
        """
        Find the start and end position of an object key in a JS object literal.
        Returns (start_pos, end_pos) or (-1, -1) if not found.
        """
        # Pattern to match: "KeyName": { ... },
        pattern = rf'"{re.escape(key)}"\s*:\s*\{{'
        match = re.search(pattern, content)
        
        if not match:
            return (-1, -1)
        
        start = match.start()
        
        # Find matching closing brace
        brace_count = 0
        i = match.end() - 1  # Start at the opening brace
        
        while i < len(content):
            if content[i] == '{':
                brace_count += 1
            elif content[i] == '}':
                brace_count -= 1
                if brace_count == 0:
                    # Find the comma after the closing brace (if exists)
                    end = i + 1
                    if end < len(content) and content[end:end+1] == ',':
                        end += 1
                    return (start, end)
            i += 1
        
        return (-1, -1)
    
    def find_case_statement(self, content: str, case_value: str) -> Tuple[int, int]:
        """
        Find a case statement in a switch block.
        Returns (start_pos, end_pos) or (-1, -1) if not found.
        """
        # Pattern: case 'value':
        pattern = rf"case\s+['\"]({re.escape(case_value)})['\"]:"
        match = re.search(pattern, content)
        
        if not match:
            return (-1, -1)
        
        start = match.start()
        
        # Find the next case, default, or closing brace
        next_case = re.search(r'\n\s*(case\s+|default\s*:|^\s*\})', content[match.end():], re.MULTILINE)
        
        if next_case:
            end = match.end() + next_case.start()
        else:
            end = len(content)
        
        return (start, end)
    
    def apply_replace(self, content: str, edit: Dict) -> str:
        """Apply a replace operation."""
        target_type = edit.get('target', 'text')
        identifier = edit['identifier']
        payload = edit['payload']
        
        if target_type == 'object_key':
            start, end = self.find_object_key(content, identifier)
            if start == -1:
                raise ValueError(f"Object key '{identifier}' not found")
            return content[:start] + payload + content[end:]
        
        elif target_type == 'case':
            start, end = self.find_case_statement(content, identifier)
            if start == -1:
                raise ValueError(f"Case statement '{identifier}' not found")
            return content[:start] + payload + content[end:]
        
        elif target_type == 'text':
            # Simple text replacement
            if identifier not in content:
                raise ValueError(f"Text '{identifier[:50]}...' not found")
            return content.replace(identifier, payload, 1)
        
        else:
            raise ValueError(f"Unknown target type: {target_type}")
    
    def apply_insert(self, content: str, edit: Dict) -> str:
        """Apply an insert operation."""
        position = edit.get('position', 'after')
        identifier = edit['identifier']
        payload = edit['payload']
        target_type = edit.get('target', 'text')
        
        if target_type == 'object_key':
            start, end = self.find_object_key(content, identifier)
            if start == -1:
                raise ValueError(f"Object key '{identifier}' not found")
            
            if position == 'after':
                return content[:end] + '\n' + payload + content[end:]
            else:
                return content[:start] + payload + '\n' + content[start:]
        
        elif target_type == 'case':
            start, end = self.find_case_statement(content, identifier)
            if start == -1:
                raise ValueError(f"Case statement '{identifier}' not found")
            
            if position == 'after':
                return content[:end] + '\n' + payload + content[end:]
            else:
                return content[:start] + payload + '\n' + content[start:]
        
        elif target_type == 'text':
            # Insert after/before text match
            if identifier not in content:
                raise ValueError(f"Text '{identifier[:50]}...' not found")
            
            idx = content.find(identifier)
            if position == 'after':
                idx += len(identifier)
            
            return content[:idx] + '\n' + payload + content[idx:]
        
        else:
            raise ValueError(f"Unknown target type: {target_type}")
    
    def apply_delete(self, content: str, edit: Dict) -> str:
        """Apply a delete operation."""
        target_type = edit.get('target', 'text')
        identifier = edit['identifier']
        
        if target_type == 'object_key':
            start, end = self.find_object_key(content, identifier)
            if start == -1:
                raise ValueError(f"Object key '{identifier}' not found")
            return content[:start] + content[end:]
        
        elif target_type == 'case':
            start, end = self.find_case_statement(content, identifier)
            if start == -1:
                raise ValueError(f"Case statement '{identifier}' not found")
            return content[:start] + content[end:]
        
        elif target_type == 'text':
            if identifier not in content:
                raise ValueError(f"Text '{identifier[:50]}...' not found")
            return content.replace(identifier, '', 1)
        
        else:
            raise ValueError(f"Unknown target type: {target_type}")
    
    def apply_edit(self, content: str, edit: Dict) -> Tuple[str, List[str]]:
        """Apply a single edit and return new content + diff."""
        action = edit['action']
        
        if action == 'replace':
            new_content = self.apply_replace(content, edit)
        elif action == 'insert':
            new_content = self.apply_insert(content, edit)
        elif action == 'delete':
            new_content = self.apply_delete(content, edit)
        else:
            raise ValueError(f"Unknown action: {action}")
        
        # Generate diff
        diff = list(unified_diff(
            content.splitlines(keepends=True),
            new_content.splitlines(keepends=True),
            fromfile='original',
            tofile='modified',
            lineterm=''
        ))
        
        return new_content, diff
    
    def run_batch(self, edits: List[Dict], dry_run: bool = False) -> Dict[str, List[str]]:
        """
        Apply a batch of edits.
        Returns a dict of {filepath: diff_lines}
        """
        results = {}
        
        for edit in edits:
            file_path = edit['file']
            print(f"\n📝 Processing: {file_path}")
            print(f"   Action: {edit['action']} | Target: {edit.get('target', 'text')} | ID: {edit['identifier'][:50]}")
            
            try:
                content = self.load_file(file_path)
                new_content, diff = self.apply_edit(content, edit)
                
                if not dry_run:
                    self.save_file(file_path, new_content)
                    print(f"   ✅ Applied successfully")
                else:
                    print(f"   🔍 Dry run - no changes written")
                
                results[file_path] = diff
                
            except Exception as e:
                print(f"   ❌ Error: {e}")
                results[file_path] = [f"ERROR: {e}"]
        
        return results


def main():
    if len(sys.argv) < 2:
        print("Usage: python code_mod.py <changes.json> [--dry-run]")
        sys.exit(1)
    
    changes_file = sys.argv[1]
    dry_run = '--dry-run' in sys.argv
    
    # Load changes
    with open(changes_file, 'r', encoding='utf-8') as f:
        changes = json.load(f)
    
    # Determine project root (parent of tools/)
    project_root = Path(__file__).parent.parent
    
    # Apply changes
    modifier = CodeModifier(str(project_root))
    results = modifier.run_batch(changes['edits'], dry_run=dry_run)
    
    # Print summary
    print("\n" + "="*60)
    print("📊 SUMMARY")
    print("="*60)
    
    for file_path, diff in results.items():
        print(f"\n📄 {file_path}")
        if diff and not diff[0].startswith('ERROR'):
            print("".join(diff[:20]))  # Show first 20 lines of diff
            if len(diff) > 20:
                print(f"... ({len(diff) - 20} more lines)")
        elif diff:
            print(diff[0])
    
    print("\n✨ Done!")


if __name__ == '__main__':
    main()
