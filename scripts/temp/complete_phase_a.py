import os

task_md_path = r'c:\Users\Sam Deiter\.gemini\antigravity\brain\87c5751b-1dc4-4bb1-b05b-4f5614fc6a28\task.md'

with open(task_md_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Mark Phase A tasks as complete
content = content.replace('- [ ] Define Audio node structures', '- [x] Define Audio node structures')
content = content.replace('- [ ] Implement AudioExecutor for sound playback', '- [x] Implement AudioExecutor for sound playback')
content = content.replace('- [ ] Define Visual Effect node structures', '- [x] Define Visual Effect node structures')
content = content.replace('- [ ] Implement VFXExecutor for particle simulation', '- [x] Implement VFXExecutor for particle simulation')
content = content.replace('- [ ] Integrate Audio/Visual nodes into the Action Menu/Palette', '- [x] Integrate Audio/Visual nodes into the Action Menu/Palette')
content = content.replace('- [ ] Verify sound playback and visual effect triggers', '- [x] Verify sound playback and visual effect triggers')

# Update overall status
content = content.replace('## 🚀 Implementation Phase A: Audio/Visual Nodes [/] IN PROGRESS', '## 🚀 Implementation Phase A: Audio/Visual Nodes ✅ COMPLETE')

with open(task_md_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Marked Phase A as complete in task.md")
