import os

manifest_path = r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\ANCHOR_MANIFEST.md'

with open(manifest_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add new anchors for documentation files
new_anchors = '''
---

## Meta-Documentation

### <!-- token-optimization-guidelines -->
**File:** `AGENTS.md`  
**Section:** "⚡ Token Optimization"  
**Lines:** (inserted dynamically)  
**What:** Guidelines for AI agents to minimize token usage  
**How:** File viewing strategies, search-first approach, context awareness, anchor references  
**Connects to:** `anchor-manifest-system`, `agents-documentation`

### <!-- anchor-manifest-system -->
**File:** `ANCHOR_MANIFEST.md`  
**Lines:** 1-end  
**What:** Central registry of all code anchors for searchable documentation  
**How:** Each anchor marks implementation point with file/function/lines/connections  
**Connects to:** `token-optimization-guidelines`, `agents-documentation`

### <!-- file-viewing-strategy -->
**File:** `AGENTS.md`  
**Section:** "Token Optimization > File Viewing Strategy"  
**What:** Best practices for efficient file access  
**How:** Use line ranges, search first, target functions, check sizes, use manifest  
**Connects to:** `token-optimization-guidelines`, `anchor-usage-pattern`

### <!-- anchor-usage-pattern -->
**File:** `ANCHOR_MANIFEST.md`  
**Section:** "Usage Examples"  
**Lines:** ~380-400  
**What:** How to search and reference anchors in codebase  
**How:** Git grep for anchor names, reference in documentation  
**Connects to:** `anchor-manifest-system`, `file-viewing-strategy`

### <!-- python-script-efficiency -->
**File:** `AGENTS.md`  
**Section:** "Token Optimization > Python Script Efficiency"  
**What:** Guidelines for efficient Python automation scripts  
**How:** Single script for multiple related changes, avoid redundant operations  
**Connects to:** `python-ui-exports-updater`, `python-app-imports-updater`

---

'''

# Insert before the final "Last Updated" line
last_updated_line = "**Last Updated:** December 2, 2025"
content = content.replace(last_updated_line, new_anchors + last_updated_line)

# Update the total anchor count
content = content.replace("**Total Anchors:** 37", "**Total Anchors:** 42")

with open(manifest_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Updated ANCHOR_MANIFEST.md")
print("📊 Added 5 new meta-documentation anchors:")
print("   - token-optimization-guidelines")
print("   - anchor-manifest-system")
print("   - file-viewing-strategy")
print("   - anchor-usage-pattern")
print("   - python-script-efficiency")
print("")
print("📈 Total anchors: 37 → 42")
