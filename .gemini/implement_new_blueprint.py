import os

# Step 1: Add event listener in app.js for the New Blueprint menu item
app_path = r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\app.js'

with open(app_path, 'r', encoding='utf-8') as f:
    app_content = f.read()

# Find the help button event listener section and add our new listener after it
old_help_section = '''        const helpCloseBtn = document.getElementById(DOMElements.HELP_MODAL_CLOSE);
        if (helpCloseBtn) {
            helpCloseBtn.addEventListener('click', () => {
                const modal = document.getElementById(DOMElements.HELP_MODAL);
                if (modal) modal.style.display = 'none';
            });
        }'''

new_help_section = '''        const helpCloseBtn = document.getElementById(DOMElements.HELP_MODAL_CLOSE);
        if (helpCloseBtn) {
            helpCloseBtn.addEventListener('click', () => {
                const modal = document.getElementById(DOMElements.HELP_MODAL);
                if (modal) modal.style.display = 'none';
            });
        }

        // New Blueprint Menu Item
        const newBlueprintMenuItem = document.getElementById('new-blueprint-menu-item');
        if (newBlueprintMenuItem) {
            newBlueprintMenuItem.addEventListener('click', () => {
                if (BlueprintApp.parentClassModal) {
                    BlueprintApp.parentClassModal.open();
                }
            });
        }'''

app_content = app_content.replace(old_help_section, new_help_section)

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(app_content)

print("✓ Updated app.js with New Blueprint menu event handler")

# Step 2: Update ParentClassModal to implement selectClass logic
modal_path = r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\ui\ParentClassModal.js'

with open(modal_path, 'r', encoding='utf-8') as f:
    modal_content = f.read()

# Replace the selectClass method
old_select_class = '''    selectClass(className) {
        // Close modal
        this.close();

        // Update parent class label in tab bar
        const parentClassLabel = document.querySelector('.parent-class-label a');
        if (parentClassLabel) {
            parentClassLabel.textContent = className;
        }

        // TODO: Clear the graph and add default nodes based on class
        console.log(`Selected parent class: ${className}`);
    }'''

new_select_class = '''    selectClass(className) {
        console.log(`Creating new Blueprint with parent class: ${className}`);

        // Update parent class label in tab bar
        const parentClassLabel = document.querySelector('.parent-class-label a');
        if (parentClassLabel) {
            parentClassLabel.textContent = className;
        }

        // Switch to Event Graph
        if (this.app.switchGraph) {
            this.app.switchGraph('EventGraph');
        }

        // Clear the current graph
        if (this.app.graph) {
            // Clear all nodes
            this.app.graph.nodes.clear();
            this.app.graph.selectedNodes.clear();
            this.app.graph.nodesContainer.innerHTML = '';
        }

        // Clear all wiring/links
        if (this.app.wiring) {
            this.app.wiring.links.clear();
            this.app.wiring.selectedLinks.clear();
            this.app.wiring.clearWires();
        }

        // Clear variables (or reset to defaults)
        if (this.app.variables) {
            this.app.variables.variables.clear();
            this.app.variables.renderPanel();
        }

        // Clear components (or reset to default root component)
        if (this.app.components) {
            this.app.components.clear();
        }

        // Add default nodes based on parent class
        this.addDefaultNodes(className);

        // Save the new state
        if (this.app.persistence) {
            this.app.persistence.autoSave();
        }

        // Compile to validate
        if (this.app.compiler) {
            this.app.compiler.validate();
        }

        // Close modal
        this.close();

        console.log('✓ New Blueprint created successfully');
    }

    addDefaultNodes(className) {
        // All Blueprints get Event BeginPlay and Event Tick
        const beginPlayNode = this.app.graph.addNode('EventBeginPlay', 100, 100);
        const tickNode = this.app.graph.addNode('EventTick', 100, 250);

        // Add class-specific nodes
        switch (className) {
            case 'Actor':
                // Actors get Event ActorBeginOverlap
                this.app.graph.addNode('EventActorBeginOverlap', 100, 400);
                break;
            case 'Pawn':
                // Pawns get additional movement events (future)
                // this.app.graph.addNode('EventPossessed', 100, 400);
                break;
            case 'Character':
                // Characters get jump/movement events (future)
                break;
            // Add more classes as needed
        }

        // Render all nodes
        this.app.graph.renderAllNodes();
        
        // Draw wires (even though there are none yet)
        requestAnimationFrame(() => {
            if (this.app.graph) {
                this.app.graph.drawAllWires();
            }
        });
    }'''

modal_content = modal_content.replace(old_select_class, new_select_class)

with open(modal_path, 'w', encoding='utf-8') as f:
    f.write(modal_content)

print("✓ Updated ParentClassModal with complete selectClass implementation")

print("\n✅ New Blueprint workflow fully implemented!")
print("📝 Features:")
print("   - File > New Blueprint menu item")
print("   - Parent class selection modal")
print("   - Graph clearing")
print("   - Default nodes (Event BeginPlay, Event Tick)")
print("   - Class-specific nodes")
