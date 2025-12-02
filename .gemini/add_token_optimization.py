import os

agents_path = r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\AGENTS.md'

with open(agents_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the "Tips for AI Agents" section and add token optimization before it
token_optimization_section = '''
## ⚡ Token Optimization

AI agents should be mindful of token usage when working on this project. Follow these guidelines:

### File Viewing Strategy
- **Don't view entire large files** - Use line ranges when possible
- **Use search first** - `grep_search` or `codebase_search` before `view_file`
- **Target specific functions** - `view_code_item` for specific functions/classes
- **Check file size** - Use `list_dir` to see file sizes before viewing
- **Use ANCHOR_MANIFEST.md** - Reference anchors instead of re-reading code

### Efficient Information Gathering
```python
# ❌ BAD: View entire 1000-line file
view_file("large_file.js")

# ✅ GOOD: Search for specific function first
grep_search("functionName", "large_file.js")
# Then view only the relevant lines
view_file("large_file.js", StartLine=100, EndLine=150)

# ✅ BEST: Use anchor manifest
# Read ANCHOR_MANIFEST.md to find:
# <!-- custom-event-execution-logic -->
# File: src/services/executors/FunctionExecutor.js
# Lines: ~137-166
view_file("src/services/executors/FunctionExecutor.js", StartLine=137, EndLine=166)
```

### Context Awareness
- **Read checkpoint summaries** - They contain crucial context, don't re-request
- **Reference conversation history** - Recent edits are documented
- **Use AGENTS.md** - This file has patterns and solutions
- **Check ANCHOR_MANIFEST.md** - Find code locations without searching

### Response Efficiency
- **Be concise but complete** - Don't repeat obvious information
- **Use code blocks** - More efficient than prose explanations
- **Summarize changes** - Bullet points > paragraphs
- **Don't over-explain** - User knows the codebase context

### Python Script Efficiency
```python
# ✅ GOOD: Single script does multiple related changes
# Update imports AND instantiation in one script

# ❌ BAD: Multiple scripts for same file
# Script 1: Update imports
# Script 2: Update instantiation
# Script 3: Update exports
```

### When NOT to Optimize
- **Critical decisions** - Explain thoroughly
- **Complex debugging** - Show full context
- **New patterns** - Document completely
- **User questions** - Answer completely

### Token Budget Awareness
- This project runs in contexts with ~200k token budgets
- Large file views (1000+ lines) cost ~2-3k tokens
- Checkpoint reads cost ~15-20k tokens
- ANCHOR_MANIFEST.md costs ~5k tokens (but provides 37 anchor references)
- Use the manifest to avoid re-reading code

---

'''

# Insert before "## 💡 Tips for AI Agents"
content = content.replace('## 💡 Tips for AI Agents', token_optimization_section + '## 💡 Tips for AI Agents')

with open(agents_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Added Token Optimization section to AGENTS.md")
print("📊 Section includes:")
print("   - File viewing strategies")
print("   - Efficient information gathering")
print("   - Context awareness")
print("   - Response efficiency")
print("   - Python script efficiency")
print("   - Token budget awareness")
