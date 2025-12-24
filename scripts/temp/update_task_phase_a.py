import os
import re

task_md_path = r'c:\Users\Sam Deiter\.gemini\antigravity\brain\87c5751b-1dc4-4bb1-b05b-4f5614fc6a28\task.md'

with open(task_md_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_phase_a = """
---

## 🚀 Implementation Phase A: Audio/Visual Nodes [/] IN PROGRESS

### Tasks

- [ ] Define Audio node structures (PlaySound2D, PlaySoundAtLocation)
- [ ] Implement AudioExecutor for sound playback
- [ ] Define Visual Effect node structures (SpawnNiagaraSystem, SpawnEmitterAtLocation)
- [ ] Implement VFXExecutor for particle simulation
- [ ] Integrate Audio/Visual nodes into the Action Menu/Palette
- [ ] Verify sound playback and visual effect triggers

**Target:** Audio/Visual coverage 0% → 100% (+5% overall parity)
"""

# Append the new phase to the end of task.md
with open(task_md_path, 'a', encoding='utf-8') as f:
    f.write(new_phase_a)

print("✓ Updated task.md with Phase A")
