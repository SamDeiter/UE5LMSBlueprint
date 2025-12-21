"""
Phase 4: Add Timer System nodes and register TimerExecutor
Modifies SimulationEngine.js and NodeDefinitions.js
"""
import re

# 1. Add TimerExecutor import to SimulationEngine.js
sim_path = r"C:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\services\SimulationEngine.js"

with open(sim_path, 'r', encoding='utf-8') as f:
    sim_content = f.read()

# Add import after VectorExecutor import
old_import = "import { VectorExecutor } from './executors/VectorExecutor.js';"
new_import = """import { VectorExecutor } from './executors/VectorExecutor.js';
import { TimerExecutor } from './executors/TimerExecutor.js';
import { timerManager } from './TimerManager.js';"""

if old_import in sim_content and 'TimerExecutor' not in sim_content:
    sim_content = sim_content.replace(old_import, new_import)
    print("✅ Added TimerExecutor and timerManager imports to SimulationEngine.js")
else:
    print("⚠️ TimerExecutor import already exists or could not find insertion point")

# Add timerManager to constructor (after actors initialization)
old_actors = "this.actors = new Map();\n        this.nextActorId = 1;"
new_actors = """this.actors = new Map();
        this.nextActorId = 1;

        // Timer Manager (Phase 4: Behavioral Optimization)
        this.timerManager = timerManager;"""

if old_actors in sim_content and 'this.timerManager' not in sim_content:
    sim_content = sim_content.replace(old_actors, new_actors)
    print("✅ Added timerManager to SimulationEngine constructor")
else:
    print("⚠️ timerManager already exists or could not find insertion point")

# Add Timer executor to executors object
old_executors = "'Actor': new ActorExecutor(this)"
new_executors = """'Actor': new ActorExecutor(this),
            'Timer': new TimerExecutor(this)"""

if old_executors in sim_content and "'Timer':" not in sim_content:
    sim_content = sim_content.replace(old_executors, new_executors)
    print("✅ Added TimerExecutor to executors object")
else:
    print("⚠️ Timer executor already exists or could not find insertion point")

with open(sim_path, 'w', encoding='utf-8') as f:
    f.write(sim_content)

# 2. Add Timer node definitions to NodeDefinitions.js
defs_path = r"C:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\data\NodeDefinitions.js"

with open(defs_path, 'r', encoding='utf-8') as f:
    defs_content = f.read()

# Find the Delay node and add timer nodes after it
old_delay_block = '''  Delay: {
    title: "Delay",
    type: "flow-node",
    category: "Utilities|Time",
    executor: "Timeline",
    icon: "fa-hourglass-half",
    pins: [
      { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
      {
        id: "duration_in",
        name: "Duration",
        type: "float",
        dir: "in",
        defaultValue: 1.0,
      },
      { id: "exec_out", name: "Completed", type: "exec", dir: "out" },
    ],
  },'''

new_delay_and_timers = '''  Delay: {
    title: "Delay",
    type: "flow-node",
    category: "Utilities|Time",
    executor: "Timeline",
    icon: "fa-hourglass-half",
    pins: [
      { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
      {
        id: "duration_in",
        name: "Duration",
        type: "float",
        dir: "in",
        defaultValue: 1.0,
      },
      { id: "exec_out", name: "Completed", type: "exec", dir: "out" },
    ],
  },
  // --- TIMER NODES (Phase 4: Behavioral Optimization) ---
  SetTimerByEvent: {
    title: "Set Timer by Event",
    type: "function-node",
    category: "Utilities|Time",
    executor: "Timer",
    icon: "fa-stopwatch",
    pins: [
      { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
      { id: "name_in", name: "Timer Name", type: "string", dir: "in", defaultValue: "MyTimer" },
      { id: "time_in", name: "Time", type: "float", dir: "in", defaultValue: 1.0 },
      { id: "looping_in", name: "Looping", type: "bool", dir: "in", defaultValue: false },
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
    ],
  },
  ClearTimer: {
    title: "Clear Timer",
    type: "function-node",
    category: "Utilities|Time",
    executor: "Timer",
    icon: "fa-stop-circle",
    pins: [
      { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
      { id: "name_in", name: "Timer Name", type: "string", dir: "in", defaultValue: "MyTimer" },
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
    ],
  },
  IsTimerActive: {
    title: "Is Timer Active",
    type: "pure-node",
    category: "Utilities|Time",
    executor: "Timer",
    icon: "fa-question-circle",
    pins: [
      { id: "name_in", name: "Timer Name", type: "string", dir: "in", defaultValue: "MyTimer" },
      { id: "is_active_out", name: "Is Active", type: "bool", dir: "out" },
    ],
  },'''

if 'SetTimerByEvent' not in defs_content:
    defs_content = defs_content.replace(old_delay_block, new_delay_and_timers)
    print("✅ Added Timer node definitions (SetTimerByEvent, ClearTimer, IsTimerActive)")
else:
    print("⚠️ Timer nodes already exist")

with open(defs_path, 'w', encoding='utf-8') as f:
    f.write(defs_content)

print("\n🎉 Phase 4: Timer System implementation complete!")
print("Nodes added: SetTimerByEvent, ClearTimer, IsTimerActive")
