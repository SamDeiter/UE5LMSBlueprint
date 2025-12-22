import json
import os

# Read the jscpd report
with open('jscpd-report.json', 'r', encoding='utf-8') as f:
    report = json.load(f)

# Extract statistics
stats = report['statistics']['formats']['javascript']['sources']

# Create a list of files with duplication
duplicates = []
for file_path, file_stats in stats.items():
    if file_stats['clones'] > 0:
        duplicates.append({
            'file': file_path.replace('src/', '').replace('\\', '/'),
            'clones': file_stats['clones'],
            'duplicated_lines': file_stats['duplicatedLines'],
            'total_lines': file_stats['lines'],
            'percentage': file_stats['percentage'],
            'tokens_dup': file_stats['duplicatedTokens'],
            'tokens_total': file_stats['tokens'],
            'token_percentage': file_stats['percentageTokens']
        })

# Sort by percentage of duplication
duplicates.sort(key=lambda x: x['percentage'], reverse=True)

# Generate markdown report
report_md = """# Code Duplication Analysis Report

**Generated**: December 21, 2025  
**Tool**: jscpd (JavaScript Copy/Paste Detector)  
**Threshold**: Minimum 5 lines, 50 tokens

---

## Executive Summary

| Metric | Value |
|--------|-------|
| **Total Files Analyzed** | {} |
| **Files with Duplication** | {} |
| **Total Clones Found** | {} |

---

## Top 10 Files by Duplication Percentage

| Rank | File | Duplication % | Clones | Duplicated Lines | Total Lines |
|------|------|---------------|--------|------------------|-------------|
""".format(
    len(stats),
    len(duplicates),
    sum(d['clones'] for d in duplicates)
)

# Add top 10
for i, dup in enumerate(duplicates[:10], 1):
    report_md += f"| {i} | `{dup['file']}` | **{dup['percentage']:.1f}%** | {dup['clones']} | {dup['duplicated_lines']} | {dup['total_lines']} |\n"

# Category analysis
report_md += """
---

## Duplication by Category

### 🔴 Critical (>50% duplication)

"""

critical = [d for d in duplicates if d['percentage'] > 50]
for dup in critical:
    report_md += f"- **`{dup['file']}`** - {dup['percentage']:.1f}% ({dup['clones']} clones)\n"

report_md += """
**Recommendation**: These files have severe duplication and should be refactored immediately using factory patterns or base classes.

### 🟡 High (20-50% duplication)

"""

high = [d for d in duplicates if 20 <= d['percentage'] <= 50]
for dup in high:
    report_md += f"- **`{dup['file']}`** - {dup['percentage']:.1f}% ({dup['clones']} clones)\n"

report_md += """
**Recommendation**: Extract common patterns into shared utilities or base classes.

### 🟢 Moderate (5-20% duplication)

"""

moderate = [d for d in duplicates if d['percentage'] < 20]
for dup in moderate:
    report_md += f"- **`{dup['file']}`** - {dup['percentage']:.1f}% ({dup['clones']} clones)\n"

report_md += """
**Recommendation**: Review for quick wins, but lower priority.

---

## Refactoring Priorities

### Priority 1: Node Definition Files

The node definition files show extreme duplication due to repetitive pin definitions:

"""

node_files = [d for d in duplicates if 'nodes/' in d['file']]
for dup in sorted(node_files, key=lambda x: x['percentage'], reverse=True):
    report_md += f"- `{dup['file']}` - {dup['percentage']:.1f}%\n"

report_md += """
**Solution**: Create a `PinFactory` utility to generate common pin patterns:
```javascript
// utils/PinFactory.js
export class PinFactory {
  static execPins() {
    return [
      { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" }
    ];
  }
  
  static vectorInput(id, name, defaultValue = "(0,0,0)") {
    return { id, name, type: "vector", dir: "in", defaultValue };
  }
  
  // ... more patterns
}
```

### Priority 2: Controller Files

"""

controller_files = [d for d in duplicates if 'Controller' in d['file']]
for dup in sorted(controller_files, key=lambda x: x['percentage'], reverse=True)[:5]:
    report_md += f"- `{dup['file']}` - {dup['percentage']:.1f}%\n"

report_md += """
**Solution**: Create a `BaseController` class with common lifecycle methods:
```javascript
// ui/BaseController.js
export class BaseController {
  constructor(app) {
    this.app = app;
    this.listeners = [];
  }
  
  addListener(element, event, handler) {
    element.addEventListener(event, handler);
    this.listeners.push({ element, event, handler });
  }
  
  cleanup() {
    this.listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
  }
}
```

### Priority 3: Executor Files

"""

executor_files = [d for d in duplicates if 'executors/' in d['file']]
for dup in sorted(executor_files, key=lambda x: x['percentage'], reverse=True):
    report_md += f"- `{dup['file']}` - {dup['percentage']:.1f}%\n"

report_md += """
**Solution**: Expand `BaseExecutor` with common execution patterns.

---

## Next Steps

1. **Create utility classes** (PinFactory, BaseController)
2. **Refactor MathNodes.js** (58.7% duplication - highest priority)
3. **Refactor CollisionNodes.js** (65.5% duplication)
4. **Refactor CollectionNodes.js** (52.9% duplication)
5. **Extract common controller patterns**
6. **Run jscpd again** to measure improvement

---

## Metrics Tracking

| Metric | Before | Target | Status |
|--------|--------|--------|--------|
| Files with >50% duplication | {} | 0 | ⏳ |
| Files with >20% duplication | {} | <5 | ⏳ |
| Total clones | {} | <30 | ⏳ |

""".format(
    len(critical),
    len(high) + len(critical),
    sum(d['clones'] for d in duplicates)
)

# Write report
with open('audit-reports/DUPLICATION_REPORT.md', 'w', encoding='utf-8') as f:
    f.write(report_md)

print(f"✅ Report generated: audit-reports/DUPLICATION_REPORT.md")
print(f"\n📊 Summary:")
print(f"   - Files analyzed: {len(stats)}")
print(f"   - Files with duplication: {len(duplicates)}")
print(f"   - Total clones: {sum(d['clones'] for d in duplicates)}")
print(f"   - Critical files (>50%): {len(critical)}")
print(f"   - High priority files (20-50%): {len(high)}")
