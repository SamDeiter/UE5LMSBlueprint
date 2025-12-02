import os

file_path = r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\app.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add ParentClassModal to the import line
old_import = "import { VariableController, PaletteController, ActionMenu, ContextMenu, DetailsController, LayoutController, TaskController, ComponentsController, NeedNodeModal, FunctionsController, MacrosController, LocalVariablesController, DebuggerController, GraphsController } from './ui.js';"
new_import = "import { VariableController, PaletteController, ActionMenu, ContextMenu, DetailsController, LayoutController, TaskController, ComponentsController, NeedNodeModal, ParentClassModal, FunctionsController, MacrosController, LocalVariablesController, DebuggerController, GraphsController } from './ui.js';"

content = content.replace(old_import, new_import)

# Add instantiation after NeedNodeModal
old_instantiation = "        BlueprintApp.needNodeModal = new NeedNodeModal(BlueprintApp);"
new_instantiation = """        BlueprintApp.needNodeModal = new NeedNodeModal(BlueprintApp);
        BlueprintApp.parentClassModal = new ParentClassModal(BlueprintApp);"""

content = content.replace(old_instantiation, new_instantiation)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Modified src/app.js successfully')
