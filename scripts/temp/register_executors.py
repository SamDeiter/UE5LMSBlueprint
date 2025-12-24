import os

engine_path = r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\services\SimulationEngine.js'

with open(engine_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Add imports
import_a = "import { AudioExecutor } from \"./executors/AudioExecutor.js\";\n"
import_v = "import { VFXExecutor } from \"./executors/VFXExecutor.js\";\n"

new_lines = []
imported_a = False
imported_v = False

for line in lines:
    if line.startswith('import ') and 'Executors' in line and not imported_a:
        # Just insert at the end of the executor imports section
        pass
    new_lines.append(line)

# Let's be more precise
final_lines = []
for line in new_lines:
    if 'import { InputExecutor }' in line:
        final_lines.append(line)
        final_lines.append(import_a)
        final_lines.append(import_v)
        continue

    # In initializeExecutors()
    if 'Input: new InputExecutor(this),' in line:
        final_lines.append(line)
        final_lines.append('      Audio: new AudioExecutor(this),\n')
        final_lines.append('      VFX: new VFXExecutor(this),\n')
        continue

    final_lines.append(line)

with open(engine_path, 'w', encoding='utf-8') as f:
    f.writelines(final_lines)

print("✓ Registered executors in SimulationEngine.js")
