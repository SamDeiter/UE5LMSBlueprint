
import os

file_path = r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\graph\Node.js'

link_fix_old = """      // Restore links if we have a match
      const preservedLinks = linkMap.get(pData.id);
      if (preservedLinks) {
        pin.links = preservedLinks;
        // Update the link objects to point to the new Pin instance
        pin.links.forEach((link) => {
          if (link.fromPin.id === pin.id) link.fromPin = pin;
          if (link.toPin.id === pin.id) link.toPin = pin;
        });
      }"""

link_fix_new = """      // Restore links if we have a match
      const preservedLinks = linkMap.get(pData.id);
      if (preservedLinks) {
        pin.links = preservedLinks;
        // Update the link objects in the registry to point to the new Pin instance
        pin.links.forEach((linkId) => {
          const lObj = this.app.wiring.findLink(linkId);
          if (lObj) {
            if (lObj.startPin.id === pin.id) lObj.startPin = pin;
            if (lObj.endPin.id === pin.id) lObj.endPin = pin;
          }
        });
      }"""

title_fix_old = """      if (propName === "class" && this.nodeKey === "SpawnActorFromClass") {
        this.title = `SpawnActor ${value || "NONE"}`;
      }"""

title_fix_new = """      if (propName === "class") {
        if (this.nodeKey === "SpawnActorFromClass") {
          this.title = `SpawnActor ${value || "NONE"}`;
        } else if (this.nodeKey === "CreateWidget") {
          this.title = `Create ${value || "NONE"}_C`;
        }
      }"""

class_widget_old = """  createClassWidget(pin) {
    const select = document.createElement("select");
    select.className = "ue-enum-select class-select";

    const VirtualAssetRegistry =
      this.app.assetInterfacingService?.virtualAssetRegistry || {};

    const noneOpt = document.createElement("option");
    noneOpt.value = "";
    noneOpt.textContent = "Select Class";
    select.appendChild(noneOpt);

    const assetTypes = {
      SpawnActorFromClass: "Actor",
      CreateWidget: "Widget",
    };
    const filterType = assetTypes[this.nodeKey] || null;

    Object.keys(VirtualAssetRegistry).forEach((key) => {
      if (!filterType || VirtualAssetRegistry[key].type === filterType) {
        const opt = document.createElement("option");
        opt.value = key;
        opt.textContent = key;
        if (this.customData.class === key) opt.selected = true;
        select.appendChild(opt);
      }
    });

    select.addEventListener("change", (e) => {
      this.onPropertyChanged("class", e.target.value);
    });

    return select;
  }"""

class_widget_new = """  createClassWidget(pin) {
    const select = document.createElement("select");
    select.className = "ue-enum-select class-select";

    const registry = this.app.assetInterfacingService?.virtualAssetRegistry || {};

    // UE5 Style: First option is Select Class (None)
    const noneOpt = document.createElement("option");
    noneOpt.value = "";
    noneOpt.textContent = "Select Class";
    select.appendChild(noneOpt);

    const nodeToAssetType = {
      "SpawnActorFromClass": "BlueprintClass",
      "CreateWidget": "WidgetBlueprint"
    };
    const targetAssetType = nodeToAssetType[this.nodeKey] || null;

    Object.entries(registry).forEach(([id, data]) => {
      // Filter based on node type (e.g. SpawnActor only shows Actors/Blueprints)
      const matchesType = !targetAssetType || data.type === targetAssetType;

      if (matchesType) {
        const opt = document.createElement("option");
        opt.value = id;
        opt.textContent = data.title || id;
        if (this.customData.class === id) opt.selected = true;
        select.appendChild(opt);
      }
    });

    select.addEventListener("change", (e) => {
      this.onPropertyChanged("class", e.target.value);
    });

    // Prevent dragging node when interacting with select
    select.addEventListener("mousedown", (e) => e.stopPropagation());

    return select;
  }"""

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(link_fix_old, link_fix_new)
content = content.replace(title_fix_old, title_fix_new)
content = content.replace(class_widget_old, class_widget_new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Surgical update of Node.js complete.")
