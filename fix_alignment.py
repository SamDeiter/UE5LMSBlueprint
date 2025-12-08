import re

# Read the file
with open(r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\ui\NeedNodeModal.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Associated Task section - needs consistent alignment
old_task_section = r'''                    <div class="form-group">
                        <label for="need-task-id">Associated Task</label>
                        <div style="display: flex; gap: 10px;">
                            <select id="need-task-id" style="flex: 1;">
                                <option value="">-- Select a Task --</option>
                            </select>
                            <button id="btn-show-create-task" class="btn-secondary" style="padding: 4px 8px; font-size: 12px;">+ New</button>
                            <button id="btn-edit-task" class="btn-secondary" style="padding: 4px 8px; font-size: 12px; display: none;">Edit</button>
                        </div>
                    </div>'''

new_task_section = r'''                    <div class="form-group" style="display: flex; align-items: center; gap: 10px;">
                        <label for="need-task-id" style="width: 120px; text-align: right; flex-shrink: 0;">Associated Task</label>
                        <div style="display: flex; gap: 10px; flex: 1;">
                            <select id="need-task-id" style="flex: 1;">
                                <option value="">-- Select a Task --</option>
                            </select>
                            <button id="btn-show-create-task" class="btn-secondary" style="padding: 4px 8px; font-size: 12px;">+ New</button>
                            <button id="btn-edit-task" class="btn-secondary" style="padding: 4px 8px; font-size: 12px; display: none;">Edit</button>
                        </div>
                    </div>'''

content = content.replace(old_task_section, new_task_section)

# Write back
with open(r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\ui\NeedNodeModal.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed Associated Task alignment')
