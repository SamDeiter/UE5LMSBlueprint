import os

readme_path = r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\README.md'

with open(readme_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add AI Agent documentation section before "Next Steps"
ai_docs_section = '''
## 🤖 For AI Agents

**Important:** Before working on this project, please read:

1. **[AGENTS.md](AGENTS.md)** - Complete developer guide
   - Project structure and patterns
   - Development workflows
   - Token optimization strategies
   - Common issues and solutions
   - User preferences (Python, Git, SCORM)

2. **[ANCHOR_MANIFEST.md](ANCHOR_MANIFEST.md)** - Code reference system
   - 42 searchable code anchors
   - Quick reference to implementations
   - Function locations and connections
   - Search with: `git grep "anchor-name"`

**Quick Start for Agents:**
```bash
# Find implementation details
git grep "custom-event-execution-logic"  # From ANCHOR_MANIFEST.md

# Reference in prompts
"Check AGENTS.md for the development patterns"
"Use anchor manifest to find parent-class-selection-logic"
```

---

'''

# Insert before "## 📝 Next Steps"
content = content.replace('## 📝 Next Steps', ai_docs_section + '## 📝 Next Steps')

with open(readme_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Updated README.md with AI Agent documentation section")
print("📚 Added instructions to read AGENTS.md and ANCHOR_MANIFEST.md")
