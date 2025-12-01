/**
 * Unit Tests for ComponentsController
 * Tests component creation, selection, deletion, and rendering
 */

export function registerComponentTests(testRunner) {
    testRunner.addTest('ComponentsController: Add Component', (app) => {
        const initialSize = app.components.size;

        // Simulate adding a component
        const componentDef = { type: 'StaticMeshComponent' };
        app.componentsController.addComponent(componentDef);

        // Verify component was added
        if (app.components.size !== initialSize + 1) {
            throw new Error(`Expected ${initialSize + 1} components, got ${app.components.size}`);
        }

        // Verify component has correct properties
        const components = [...app.components.values()];
        const newComponent = components[components.length - 1];

        if (!newComponent.id) throw new Error('Component missing id');
        if (!newComponent.name) throw new Error('Component missing name');
        if (newComponent.type !== 'StaticMeshComponent') {
            throw new Error(`Expected type 'StaticMeshComponent', got '${newComponent.type}'`);
        }

        return true;
    });

    testRunner.addTest('ComponentsController: Select Component', (app) => {
        // Add a component first
        const componentDef = { type: 'PointLightComponent' };
        app.componentsController.addComponent(componentDef);

        const components = [...app.components.values()];
        const component = components[components.length - 1];

        // Select the component
        app.componentsController.selectComponent(component.id);

        // Verify selection
        if (!app.componentsController.selectedComponentIds.has(component.id)) {
            throw new Error('Component was not selected');
        }

        // Verify variable selection was cleared
        if (app.details.currentVariable !== null) {
            throw new Error('Variable selection should be cleared when selecting component');
        }

        return true;
    });

    testRunner.addTest('ComponentsController: Delete Component (programmatic)', (app) => {
        // Add a component
        const componentDef = { type: 'AudioComponent' };
        app.componentsController.addComponent(componentDef);

        const initialSize = app.components.size;
        const components = [...app.components.values()];
        const componentToDelete = components[components.length - 1];

        // Execute deletion directly (bypass modal)
        app.componentsController.selectComponent(componentToDelete.id);
        app.componentsController.executeDeletion();

        // Verify component was deleted
        if (app.components.size !== initialSize - 1) {
            throw new Error(`Expected ${initialSize - 1} components, got ${app.components.size}`);
        }

        if (app.components.has(componentToDelete.id)) {
            throw new Error('Component still exists in map after deletion');
        }

        return true;
    });

    testRunner.addTest('ComponentsController: Update Node Library on Add', (app) => {
        const componentDef = { type: 'CameraComponent' };
        app.componentsController.addComponent(componentDef);

        const components = [...app.components.values()];
        const component = components[components.length - 1];

        // Check that Get and Set nodes were registered
        const getKey = `GetComponent_${component.id}`;
        const setKey = `SetComponent_${component.id}`;

        const allNodes = app.nodeRegistry.getAll();

        if (!allNodes[getKey]) {
            throw new Error(`Get node '${getKey}' not registered`);
        }

        if (!allNodes[setKey]) {
            throw new Error(`Set node '${setKey}' not registered`);
        }

        return true;
    });

    testRunner.addTest('ComponentsController: Update Node Library on Delete', (app) => {
        // Add a component
        const componentDef = { type: 'ParticleSystemComponent' };
        app.componentsController.addComponent(componentDef);

        const components = [...app.components.values()];
        const component = components[components.length - 1];
        const getKey = `GetComponent_${component.id}`;
        const setKey = `SetComponent_${component.id}`;

        // Verify nodes are registered
        let allNodes = app.nodeRegistry.getAll();
        if (!allNodes[getKey] || !allNodes[setKey]) {
            throw new Error('Component nodes not registered before deletion');
        }

        // Delete the component
        app.componentsController.selectComponent(component.id);
        app.componentsController.executeDeletion();

        // Verify nodes are unregistered
        allNodes = app.nodeRegistry.getAll();
        if (allNodes[getKey]) {
            throw new Error(`Get node '${getKey}' still registered after deletion`);
        }

        if (allNodes[setKey]) {
            throw new Error(`Set node '${setKey}' still registered after deletion`);
        }

        return true;
    });

    testRunner.addTest('ComponentsController: Render Updates After Add', (app) => {
        const initialHTML = app.componentsController.listContainer.innerHTML;

        const componentDef = { type: 'BoxComponent' };
        app.componentsController.addComponent(componentDef);

        const updatedHTML = app.componentsController.listContainer.innerHTML;

        if (initialHTML === updatedHTML) {
            throw new Error('Panel HTML did not update after adding component');
        }

        const components = [...app.components.values()];
        const component = components[components.length - 1];

        // Check that component appears in the rendered HTML
        if (!updatedHTML.includes(component.name)) {
            throw new Error(`Component name '${component.name}' not found in rendered panel`);
        }

        return true;
    });

    testRunner.addTest('ComponentsController: Render Updates After Delete', (app) => {
        // Add a component
        const componentDef = { type: 'SphereComponent' };
        app.componentsController.addComponent(componentDef);

        const components = [...app.components.values()];
        const component = components[components.length - 1];
        const componentName = component.name;

        // Verify it's in the HTML
        let html = app.componentsController.listContainer.innerHTML;
        if (!html.includes(componentName)) {
            throw new Error('Component not found in HTML before deletion');
        }

        // Delete the component
        app.componentsController.selectComponent(component.id);
        app.componentsController.executeDeletion();

        // Verify it's removed from HTML
        html = app.componentsController.listContainer.innerHTML;
        if (html.includes(componentName)) {
            throw new Error('Component still appears in HTML after deletion');
        }

        return true;
    });
}
