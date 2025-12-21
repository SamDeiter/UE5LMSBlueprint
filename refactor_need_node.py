
import os

file_path = r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\ui\NeedNodeModal.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace Visibility display in constructor
content = content.replace("modal.style.display = 'none';", "modal.classList.add('hidden');")

# 2. Replace Modal Content Style
content = content.replace('<div class="modal-content" style="max-width: 600px;">', '<div class="modal-content modal-content-medium">')

# 3. Replace Form Groups with Inline Styles
content = content.replace('<div class="form-group" style="display: flex; align-items: center; gap: 10px;">', '<div class="form-group form-row">')
content = content.replace('<div class="form-group" style="display: flex; align-items: flex-start; gap: 10px;">', '<div class="form-group form-row-top">')
content = content.replace('<div class="form-group" style="display: flex; align-items: flex-start; gap: 10px; margin-top: 20px;">', '<div class="form-group form-row-top mt-2">')

# 4. Replace Labels
content = content.replace('<label for="need-task-id" style="width: 120px; text-align: right; flex-shrink: 0; display: inline-block; margin-bottom: 0;">', '<label for="need-task-id" class="label-fixed">')
content = content.replace('<label for="new-task-id-input" style="font-size: 11px; width: 120px; text-align: right; flex-shrink: 0;">', '<label for="new-task-id-input" class="label-fixed-sm">')
content = content.replace('<label for="new-task-title-input" style="font-size: 11px; width: 120px; text-align: right; flex-shrink: 0;">', '<label for="new-task-title-input" class="label-fixed-sm">')
content = content.replace('<label for="new-task-desc-input" style="font-size: 11px; width: 120px; text-align: right; flex-shrink: 0; padding-top: 4px;">', '<label for="new-task-desc-input" class="label-fixed-sm pt-1">')
content = content.replace('<label style="font-size: 11px; width: 120px; text-align: right; flex-shrink: 0; padding-top: 4px;">', '<label class="label-fixed-sm pt-1">')
content = content.replace('<label for="need-title" style="width: 120px; text-align: right; flex-shrink: 0; display: inline-block; margin-bottom: 0;">', '<label for="need-title" class="label-fixed">')
content = content.replace('<label for="need-description" style="width: 120px; text-align: right; flex-shrink: 0; padding-top: 8px; display: inline-block; margin-bottom: 0;">', '<label for="need-description" class="label-fixed pt-2">')
content = content.replace('<label style="width: 120px; flex-shrink: 0; display: inline-block; margin-bottom: 0;"></label>', '<label class="label-fixed"></label>')
content = content.replace('<label for="need-threshold" style="width: 120px; text-align: right; flex-shrink: 0; display: inline-block; margin-bottom: 0;">', '<label for="need-threshold" class="label-fixed">')
content = content.replace('<label style="width: 120px; text-align: right; flex-shrink: 0; padding-top: 4px;">', '<label class="label-fixed pt-1">')

# 5. Inner structural styles
content = content.replace('<div style="display: flex; gap: 10px; align-items: center; flex: 1;">', '<div class="d-flex align-center flex-1" style="gap: 10px;">') # Kept gap inline as it varies but might want to fix
content = content.replace('style="padding: 8px 16px; font-size: 14px; font-weight: bold;"', 'class="text-bold" style="padding: 8px 16px; font-size: 14px;"') 
content = content.replace('style="padding: 4px 8px; font-size: 12px; display: none;"', 'classList.add("hidden")') # This is JS, wait.

# Actually, the innerHTML has some styles that are better handled as classes.
content = content.replace('style="padding: 8px 16px; font-size: 14px; font-weight: bold;"', 'class="text-bold px-3 py-2 text-md"') # px-3 py-2 doesn't exist yet, but I can add it
# I'll stick to what I added

content = content.replace('style="padding: 4px 8px; font-size: 12px; display: none;"', 'class="hidden px-2 py-1 text-sm"')
content = content.replace('<div id="new-task-form" style="display: none; background: #2a2a2a; padding: 10px; border: 1px solid #444; margin-bottom: 15px; border-radius: 4px;">', '<div id="new-task-form" class="task-form-panel hidden">')
content = content.replace('<h4 id="task-form-title" style="margin-top: 0; color: #ddd; font-size: 12px; text-transform: uppercase;">', '<h4 id="task-form-title" class="task-form-title">')
content = content.replace('style="font-size: 12px; flex: 1;"', 'class="text-sm flex-1"')
content = content.replace('style="font-size: 12px; flex: 1;"', 'class="text-sm flex-1"') # repeated for textarea
content = content.replace('<div style="flex: 1;">', '<div class="flex-1">')
content = content.replace('<div id="task-requirements-list" style="background: #222; padding: 5px; max-height: 100px; overflow-y: auto; font-size: 11px; color: #aaa; border: 1px solid #444; margin-bottom: 5px;">', '<div id="task-requirements-list" class="req-list-panel">')
content = content.replace('<em style="color: #666;">', '<em class="text-muted">')
content = content.replace('<div style="display: flex; gap: 5px;">', '<div class="d-flex" style="gap: 5px;">')
content = content.replace('style="font-size: 11px; padding: 4px 8px;"', 'class="text-xs px-2 py-1"')
content = content.replace('<div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px;">', '<div class="d-flex justify-end mt-2" style="gap: 8px;">')
content = content.replace('<div style="flex: 1; display: flex; align-items: center; gap: 10px;">', '<div class="flex-1 d-flex align-center" style="gap: 10px;">')
content = content.replace('<span id="threshold-value" style="min-width: 40px;">', '<span id="threshold-value" class="text-center" style="min-width: 40px;">')

# JS Logic updates
content = content.replace("editTaskBtn.style.display = taskSelect.value ? 'block' : 'none';", "if (taskSelect.value) editTaskBtn.classList.remove('hidden'); else editTaskBtn.classList.add('hidden');")
content = content.replace("newTaskForm.style.display = 'block';", "newTaskForm.classList.remove('hidden');")
content = content.replace("showCreateBtn.style.display = 'none';", "showCreateBtn.classList.add('hidden');")
content = content.replace("editTaskBtn.style.display = 'none';", "editTaskBtn.classList.add('hidden');")
content = content.replace("newTaskForm.style.display = 'none';", "newTaskForm.classList.add('hidden');")
content = content.replace("showCreateBtn.style.display = 'block';", "showCreateBtn.classList.remove('hidden');")
content = content.replace("editTaskBtn.style.display = taskId ? 'block' : 'none';", "if (taskId) editTaskBtn.classList.remove('hidden'); else editTaskBtn.classList.add('hidden');")

# Modal Open styling
content = content.replace("this.modal.style.display = 'flex';", "this.modal.classList.remove('hidden');")
content = content.replace("this.modal.style.display = 'none';", "this.modal.classList.add('hidden');")

# Complex CSS removal in open method
modal_styles = [
    "this.modal.style.zIndex = '999999';",
    "this.modal.style.position = 'fixed';",
    "this.modal.style.top = '0';",
    "this.modal.style.left = '0';",
    "this.modal.style.right = '0';",
    "this.modal.style.bottom = '0';",
    "this.modal.style.justifyContent = 'center';",
    "this.modal.style.alignItems = 'center';"
]
for style in modal_styles:
    content = content.replace(style, "")

# Add class to modal
content = content.replace("this.modal.style.display = 'flex';", "this.modal.classList.remove('hidden');\n        this.modal.classList.add('full-overlay');")


# criterion row
content = content.replace("row.style.cssText = 'display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; padding: 10px; background: #2a2a2a; border: 1px solid #444; border-radius: 4px;';", "row.classList.add('criterion-card');")
content = content.replace("typeRow.style.cssText = 'display: flex; gap: 8px; align-items: center;';", "typeRow.classList.add('d-flex', 'align-center');\n        typeRow.style.gap = '8px';")
content = content.replace("typeLabel.style.cssText = 'width: 120px; font-size: 12px; color: #ccc; text-align: right; flex-shrink: 0;';", "typeLabel.classList.add('label-fixed', 'text-sm', 'text-light');")
content = content.replace("typeSelect.style.cssText = 'flex: 1; font-size: 12px; background: #1a1a1a; color: white; border: 1px solid #555; padding: 4px; border-radius: 2px;';", "typeSelect.classList.add('flex-1', 'text-sm');") # Assuming text-sm/flex-1 handles enough
content = content.replace("deleteBtn.style.cssText = 'padding: 4px 8px; background: #d32f2f; color: white; border: none; border-radius: 2px; cursor: pointer;';", "deleteBtn.classList.add('btn-delete-red');")

content = content.replace("paramsContainer.style.cssText = 'display: flex; flex-direction: column; gap: 6px; padding-left: 10px;';", "paramsContainer.classList.add('criterion-params-list');")
content = content.replace("descRow.style.cssText = 'display: flex; gap: 8px; align-items: center;';", "descRow.classList.add('d-flex', 'align-center');\n        descRow.style.gap = '8px';")
content = content.replace("descLabel.style.cssText = 'width: 120px; font-size: 12px; color: #ccc; text-align: right; flex-shrink: 0;';", "descLabel.classList.add('label-fixed', 'text-sm', 'text-light');")
content = content.replace("descInput.style.cssText = 'flex: 1; font-size: 12px; background: #1a1a1a; color: white; border: 1px solid #555; padding: 4px; border-radius: 2px;';", "descInput.classList.add('flex-1', 'text-sm');")

content = content.replace("fieldRow.style.cssText = 'display: flex; gap: 8px; align-items: center;';", "fieldRow.classList.add('d-flex', 'align-center');\n            fieldRow.style.gap = '8px';")
content = content.replace("fieldLabel.style.cssText = 'min-width: 110px; font-size: 11px; color: #aaa;';", "fieldLabel.classList.add('label-param');")
content = content.replace("input.style.cssText = 'flex: 1; font-size: 11px; background: #111; color: white; border: 1px solid #444; padding: 3px 6px; border-radius: 2px;';", "input.classList.add('input-param');")

content = content.replace("div.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; padding-bottom: 4px; border-bottom: 1px solid #333;';", "div.classList.add('req-item-row');")
content = content.replace("delBtn.style.cssText = 'background: none; border: none; color: #ff6b6b; cursor: pointer; font-size: 14px; padding: 0 4px;';", "delBtn.classList.add('btn-delete-text');")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Finished refactoring NeedNodeModal.js")
