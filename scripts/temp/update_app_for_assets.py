import re
import os

def update_app_js():
    path = r"c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\app.js"
    with open(path, "r", encoding="utf-8", newline="") as f:
        content = f.read()

    # Add import
    if "import { AssetInterfacingService }" not in content:
        import_line = 'import { AssetInterfacingService } from "./services/AssetInterfacingService.js";'
        content = re.sub(r'(import { BreakpointManager } from "./services/BreakpointManager.js";)',
                        r'\1\n' + import_line, content)

    # Initialize service
    if "BlueprintApp.assetInterfacingService = new AssetInterfacingService(BlueprintApp);" not in content:
        init_line = '    BlueprintApp.assetInterfacingService = new AssetInterfacingService(BlueprintApp);'
        content = re.sub(r'(BlueprintApp.breakpointManager = new BreakpointManager\(\);)',
                        r'\1\n' + init_line, content)

    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(content)
    print("Updated app.js")

if __name__ == "__main__":
    update_app_js()
