#!/usr/bin/env python3
"""Fix all form alignment to be consistent - labels should be above inputs (block layout)"""

# Read the file
with open(r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\ui\NeedNodeModal.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove all the flexbox styling and go back to simple block layout (labels above inputs)
# This matches the "Associated Task" layout which works correctly

# Fix Title row
content = content.replace(
    '<div class="form-group" style="display: flex; align-items: center; gap: 10px;">\r\n                        <label for="need-title" style="width: 120px; text-align: right; flex-shrink: 0; display: inline-block; margin-bottom: 0;">Title</label>\r\n                        <input type="text" id="need-title" placeholder="e.g., Connect Light Component" style="flex: 1;" />',
    '<div class="form-group">\r\n                        <label for="need-title">Title</label>\r\n                        <input type="text" id="need-title" placeholder="e.g., Connect Light Component" />'
)

# Fix Description row
content = content.replace(
    '<div class="form-group" style="display: flex; align-items: flex-start; gap: 10px;">\r\n                        <label for="need-description" style="width: 120px; text-align: right; flex-shrink: 0; padding-top: 8px; display: inline-block; margin-bottom: 0;">Description</label>\r\n                        <textarea id="need-description" rows="3" placeholder="Detailed explanation of what students need to accomplish..." style="flex: 1;"></textarea>',
    '<div class="form-group">\r\n                        <label for="need-description">Description</label>\r\n                        <textarea id="need-description" rows="3" placeholder="Detailed explanation of what students need to accomplish..."></textarea>'
)

# Fix Hidden checkbox row
content = content.replace(
    '<div class="form-group" style="display: flex; align-items: center; gap: 10px;">\r\n                        <label style="width: 120px; flex-shrink: 0; display: inline-block; margin-bottom: 0;"></label>\r\n                        <label style="flex: 1;">\r\n                            <input type="checkbox" id="need-hidden" />\r\n                            Hidden from students (assessment mode)\r\n                        </label>\r\n                    </div>',
    '<div class="form-group">\r\n                        <label>\r\n                            <input type="checkbox" id="need-hidden" />\r\n                            Hidden from students (assessment mode)\r\n                        </label>\r\n                    </div>'
)

# Fix Pass Threshold row
content = content.replace(
    '<div class="form-group" style="display: flex; align-items: center; gap: 10px;">\r\n                        <label for="need-threshold" style="width: 120px; text-align: right; flex-shrink: 0; display: inline-block; margin-bottom: 0;">Pass Threshold</label>\r\n                        <div style="flex: 1; display: flex; align-items: center; gap: 10px;">\r\n                            <input type="range" id="need-threshold" min="0" max="100" value="80" step="5" style="flex: 1;" />\r\n                            <span id="threshold-value" style="min-width: 40px;">80</span>%\r\n                        </div>\r\n                    </div>',
    '<div class="form-group">\r\n                        <label for="need-threshold">Pass Threshold: <span id="threshold-value">80</span>%</label>\r\n                        <input type="range" id="need-threshold" min="0" max="100" value="80" step="5" style="width: 100%;" />\r\n                    </div>'
)

# Fix Criteria row
content = content.replace(
    '<div class="form-group" style="display: flex; align-items: flex-start; gap: 10px; margin-top: 20px;">\r\n                        <label style="width: 120px; text-align: right; flex-shrink: 0; padding-top: 4px;">Criteria</label>\r\n                        <div style="flex: 1;">\r\n                            <div id="criteria-list"></div>\r\n                            <button type="button" id="add-criterion" class="btn-secondary">+ Add Criterion</button>\r\n                        </div>\r\n                    </div>',
    '<div class="form-group" style="margin-top: 20px;">\r\n                        <label style="display: block; margin-bottom: 10px;">Criteria</label>\r\n                        <div id="criteria-list"></div>\r\n                        <button type="button" id="add-criterion" class="btn-secondary">+ Add Criterion</button>\r\n                    </div>'
)

# Write back
with open(r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\ui\NeedNodeModal.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Reverted to block layout - labels above inputs for consistent alignment')
