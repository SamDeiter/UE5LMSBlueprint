import os

roadmap_path = r'c:\Users\Sam Deiter\.gemini\antigravity\brain\87c5751b-1dc4-4bb1-b05b-4f5614fc6a28\next_steps_roadmap.md'
task_path = r'c:\Users\Sam Deiter\.gemini\antigravity\brain\87c5751b-1dc4-4bb1-b05b-4f5614fc6a28\task.md'

# Update Roadmap
with open(roadmap_path, 'r', encoding='utf-8') as f:
    roadmap = f.read()

roadmap = roadmap.replace("Students create interactive experiences", "Allows testing knowledge of audio and visual feedback triggers")
roadmap = roadmap.replace("Enables complete gameplay examples", "Enables testing complex interaction and collision logic")
roadmap = roadmap.replace("video tutorials", "assessment criteria documentation")
roadmap = roadmap.replace("tutorials", "usage documentation")
roadmap = roadmap.replace("production-ready for educational use", "production-ready for Blueprint knowledge assessment")
roadmap = roadmap.replace("Students love it", "Essential for verifying comprehensive node knowledge")

with open(roadmap_path, 'w', encoding='utf-8') as f:
    f.write(roadmap)

# Update Task.md - remove "tutorial" references and fix descriptions
with open(task_path, 'r', encoding='utf-8') as f:
    task = f.read()

task = task.replace("interactive experiences", "assessment scenarios")
task = task.replace("how to test these", "how these function in the testing environment")

with open(task_path, 'w', encoding='utf-8') as f:
    f.write(task)

print("✓ Refined roadmap and task list to focus on testing/assessment.")
