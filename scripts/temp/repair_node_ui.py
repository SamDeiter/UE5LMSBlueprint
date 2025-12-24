import os

path = r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\graph\Node.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Clean up Duplicated Lines
content = content.replace('this.element.style.left = `${this.x}px`; // Dynamic position // Dynamic position', 'this.element.style.left = `${this.x}px`;')
content = content.replace('this.element.style.top = `${this.y}px`; // Dynamic position // Dynamic position', 'this.element.style.top = `${this.y}px`;')

# 2. Define the new render() method
new_render = """  render() {
    if (!this.nodeKey) {
      console.error(`Node ${this.id} missing nodeKey.`);
      this.nodeKey = "INVALID_NODE";
    }

    if (this.type === NODE_TYPES.COMMENT) {
      return this.renderCommentNode();
    }

    if (
      this.nodeKey.startsWith("Get_") ||
      this.nodeKey.startsWith("Conv_") ||
      this.nodeKey.startsWith("GetComponent_") ||
      (this.nodeKey.startsWith("Func_") && this.type === NODE_TYPES.PURE)
    ) {
      return this.renderCompactNode();
    }

    const element = document.createElement("div");
    element.id = this.id;
    element.className = `node ${this.type.toLowerCase().replace(/_/g, "-")}-node`;
    element.style.left = `${this.x}px`;
    element.style.top = `${this.y}px`;

    if (this.customData && this.customData.advancedExpanded) {
      element.classList.add("advanced-expanded");
    }

    const header = document.createElement("div");
    this.headerElement = header;
    header.className = "node-title";

    const gradient = this.getHeaderColor();
    header.style.background = `linear-gradient(to bottom, ${gradient.start}, ${gradient.end})`;

    // Breakpoint Support
    const hasBreakpoint = this.app.breakpointManager && this.app.breakpointManager.hasBreakpoint(this.id);
    if (hasBreakpoint) {
      header.classList.add("has-breakpoint");
      const bpIcon = document.createElement("div");
      bpIcon.className = "breakpoint-icon";
      bpIcon.innerHTML = UE5Renderer.renderBreakpointIcon();
      header.appendChild(bpIcon);
    }

    // Header Icon
    if (this.type === NODE_TYPES.EVENT) {
      const iconEl = document.createElement("span");
      iconEl.className = "node-header-icon event-icon";
      iconEl.innerHTML = UE5Renderer.renderEventHeaderIcon();
      header.appendChild(iconEl);
    } else if (this.icon) {
      const iconEl = document.createElement("span");
      if (this.icon.startsWith("ue5/")) {
        iconEl.className = "node-header-icon ue5-icon";
        const img = document.createElement("img");
        img.src = `/assets/icons/${this.icon}`;
        img.className = "ue5-icon-svg";
        iconEl.appendChild(img);
      } else if (this.icon === "f") {
        iconEl.className = "fas fa-function text-italic mr-1";
        iconEl.textContent = "f";
      }
      header.appendChild(iconEl);
    }

    // Title
    const titleSpan = document.createElement("span");
    titleSpan.textContent = this.nodeKey.startsWith("Set_") ? "SET" : this.title;
    header.appendChild(titleSpan);

    if (this.type === NODE_TYPES.EVENT) {
      const delegateIcon = document.createElement("div");
      delegateIcon.className = "event-delegate-icon";
      header.appendChild(delegateIcon);
    }

    element.appendChild(header);

    const content = document.createElement("div");
    content.className = "node-content";

    // Build Pins
    const inColumn = document.createElement("div");
    inColumn.className = "pin-column in";
    const outColumn = document.createElement("div");
    outColumn.className = "pin-column out";

    let hasAdvanced = false;

    this.pinsIn.forEach(pin => {
      const pinEl = this.renderPin(pin, "in");
      if (pin.advanced) {
        pinEl.classList.add("advanced");
        hasAdvanced = true;
        if (pin.links && pin.links.length > 0) pinEl.classList.add("connected");
      }
      inColumn.appendChild(pinEl);
    });

    this.pinsOut.forEach(pin => {
      const pinEl = this.renderPin(pin, "out");
      if (pin.advanced) {
        pinEl.classList.add("advanced");
        hasAdvanced = true;
        if (pin.links && pin.links.length > 0) pinEl.classList.add("connected");
      }
      outColumn.appendChild(pinEl);
    });

    content.appendChild(inColumn);
    content.appendChild(outColumn);
    element.appendChild(content);

    // Advanced Toggle
    if (hasAdvanced) {
      const toggle = document.createElement("div");
      toggle.className = "advanced-toggle-container";
      if (this.customData && this.customData.advancedExpanded) toggle.classList.add("expanded");

      const icon = document.createElement("div");
      icon.className = "advanced-toggle-icon";
      toggle.appendChild(icon);

      toggle.addEventListener("mousedown", (e) => {
        e.stopPropagation();
        this.toggleAdvanced();
      });
      element.appendChild(toggle);
    }

    this.element = element;
    this.setupEvents();
    return element;
  }"""

# 3. Define toggleAdvanced()
new_toggle = """  toggleAdvanced() {
    if (!this.customData) this.customData = {};
    this.customData.advancedExpanded = !this.customData.advancedExpanded;

    if (this.element) {
      if (this.customData.advancedExpanded) {
        this.element.classList.add("advanced-expanded");
        const toggle = this.element.querySelector(".advanced-toggle-container");
        if (toggle) toggle.classList.add("expanded");
      } else {
        this.element.classList.remove("advanced-expanded");
        const toggle = this.element.querySelector(".advanced-toggle-container");
        if (toggle) toggle.classList.remove("expanded");
      }
    }

    if (this.app && this.app.graph) {
      this.app.graph.requestRedraw();
    }
    this.app.persistence.autoSave();
  }"""

# Locate and replace render()
import re
# Find the broken render method start
render_pattern = r'  render\(\) \{.*?this\.element = element;\n    return element;\n  \}'
# The corruption in Step 2117 actually has a very weird structure.
# I'll look for line 223 - 476.
start_marker = '  render() {'
end_marker = '    return element;\n  }'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker, start_idx) + len(end_marker)

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + new_render + "\n\n" + new_toggle + content[end_idx:]
else:
    print("Could not find render() method to replace")

# 4. Update renderPin to support labels/formatting
new_render_pindef = """  renderPin(pin, type) {
    const pinEl = document.createElement("div");
    pinEl.className = `pin ${pin.type} ${pin.dir}`;
    pinEl.id = pin.id;

    const labelEl = document.createElement("span");
    labelEl.className = "pin-label";

    if (pin.type === "exec") {
      labelEl.textContent = "";
      labelEl.classList.add("hidden");
    } else {
      labelEl.textContent = Utils.formatNodeProperty(pin.name || "");
    }

    if (pin.dir === "in") {
      pinEl.appendChild(this.renderPinDot(pin));
      pinEl.appendChild(labelEl);
      const widget = this.createInputWidget(pin);
      if (widget) pinEl.appendChild(widget);
    } else {
      pinEl.appendChild(labelEl);
      pinEl.appendChild(this.renderPinDot(pin));
    }
    return pinEl;
  }"""

# Replace renderPin and renderSinglePin (which was also mangled or redundant)
# I'll just replace renderPin and delete renderSinglePin if I find it duplicated or broken.
content = re.sub(r'  renderPin\(pin, type\) \{.*?    return pinEl;\n  \}', new_render_pindef, content, flags=re.DOTALL)
content = re.sub(r'  renderSinglePin\(pin, parentPin = null, hideLabel = false\) \{.*?    return pinContainer;\n  \}', '', content, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Node.js repaired and updated.")
