# Component System Implementation Plan

## Overview
The Component System allows users to add reusable functional pieces (Components) to their Blueprint, similar to Unreal Engine's Actor Components (e.g., StaticMesh, Camera, PointLight).

## 1. Data Model

### Component Object
Each component will be an object stored in a `components` map within the `BlueprintApp` (and persisted in `HistoryManager`).

```javascript
{
    id: "comp-12345",
    name: "StaticMesh",
    type: "StaticMeshComponent",
    parentId: "root", // For hierarchy
    properties: {
        // Component-specific properties
        StaticMesh: "None",
        Material: "None",
        Transform: { location: {x,y,z}, rotation: {x,y,z}, scale: {x,y,z} }
    }
}
```

### App State
Update `BlueprintApp` and `HistoryManager` to include a `components` Map.

## 2. UI Implementation

### Components Panel
*   **Location**: Top-left sidebar (above "My Blueprint").
*   **Structure**: Tree view showing the hierarchy of components.
*   **Features**:
    *   **Add Button**: Dropdown to select component type (Static Mesh, Camera, Audio, etc.).
    *   **Drag & Drop**: Drag components into the Graph to create `Get` nodes.
    *   **Selection**: Clicking a component shows its properties in the Details Panel.

### Details Panel Integration
*   Update `DetailsController` to handle `Component` selection.
*   Render property inputs based on the component type (Transform, Mesh selection, etc.).

## 3. Graph Integration

### Component Nodes
*   **Get Component**: Pure node that returns a reference to the component.
*   **Component Functions**: Nodes that operate on components (e.g., `Set Static Mesh`, `Add Local Rotation`).
    *   These nodes will need a `Target` pin that accepts a Component reference.

## 4. Rendering (Future)
*   Eventually, we may need a "Viewport" tab to visualize the components in 3D or 2D space.

## Implementation Steps

# Component System Implementation Plan

## Overview
The Component System allows users to add reusable functional pieces (Components) to their Blueprint, similar to Unreal Engine's Actor Components (e.g., StaticMesh, Camera, PointLight).

## 1. Data Model

### Component Object
Each component will be an object stored in a `components` map within the `BlueprintApp` (and persisted in `HistoryManager`).

```javascript
{
    id: "comp-12345",
    name: "StaticMesh",
    type: "StaticMeshComponent",
    parentId: "root", // For hierarchy
    properties: {
        // Component-specific properties
        StaticMesh: "None",
        Material: "None",
        Transform: { location: {x,y,z}, rotation: {x,y,z}, scale: {x,y,z} }
    }
}
```

### App State
Update `BlueprintApp` and `HistoryManager` to include a `components` Map.

## 2. UI Implementation

### Components Panel
*   **Location**: Top-left sidebar (above "My Blueprint").
*   **Structure**: Tree view showing the hierarchy of components.
*   **Features**:
    *   **Add Button**: Dropdown to select component type (Static Mesh, Camera, Audio, etc.).
    *   **Drag & Drop**: Drag components into the Graph to create `Get` nodes.
    *   **Selection**: Clicking a component shows its properties in the Details Panel.

### Details Panel Integration
*   Update `DetailsController` to handle `Component` selection.
*   Render property inputs based on the component type (Transform, Mesh selection, etc.).

## 3. Graph Integration

### Component Nodes
*   **Get Component**: Pure node that returns a reference to the component.
*   **Component Functions**: Nodes that operate on components (e.g., `Set Static Mesh`, `Add Local Rotation`).
    *   These nodes will need a `Target` pin that accepts a Component reference.

## 4. Rendering (Future)
*   Eventually, we may need a "Viewport" tab to visualize the components in 3D or 2D space.

## Implementation Steps
# Component System Implementation Plan

## Overview
The Component System allows users to add reusable functional pieces (Components) to their Blueprint, similar to Unreal Engine's Actor Components (e.g., StaticMesh, Camera, PointLight).

## 1. Data Model

### Component Object
Each component will be an object stored in a `components` map within the `BlueprintApp` (and persisted in `HistoryManager`).

```javascript
{
    id: "comp-12345",
    name: "StaticMesh",
    type: "StaticMeshComponent",
    parentId: "root", // For hierarchy
    properties: {
        // Component-specific properties
        StaticMesh: "None",
        Material: "None",
        Transform: { location: {x,y,z}, rotation: {x,y,z}, scale: {x,y,z} }
    }
}
```

### App State
Update `BlueprintApp` and `HistoryManager` to include a `components` Map.

## 2. UI Implementation

### Components Panel
*   **Location**: Top-left sidebar (above "My Blueprint").
*   **Structure**: Tree view showing the hierarchy of components.
*   **Features**:
    *   **Add Button**: Dropdown to select component type (Static Mesh, Camera, Audio, etc.).
    *   **Drag & Drop**: Drag components into the Graph to create `Get` nodes.
    *   **Selection**: Clicking a component shows its properties in the Details Panel.

### Details Panel Integration
*   Update `DetailsController` to handle `Component` selection.
*   Render property inputs based on the component type (Transform, Mesh selection, etc.).

## 3. Graph Integration

### Component Nodes
*   **Get Component**: Pure node that returns a reference to the component.
*   **Component Functions**: Nodes that operate on components (e.g., `Set Static Mesh`, `Add Local Rotation`).
    *   These nodes will need a `Target` pin that accepts a Component reference.

## 4. Rendering (Future)
*   Eventually, we may need a "Viewport" tab to visualize the components in 3D or 2D space.

## Implementation Steps

### Phase 1: Foundation
1.  [x] Update `BlueprintApp` to store `components`.
2.  [x] Update `Persistence` and `HistoryManager` to save/load `components`.
3.  [x] Create `ComponentsController.js` for the UI panel.

### Phase 2: Component UI & Interaction (Completed)
- [x] Implement "Add Component" dropdown/modal to select component type.
- [x] Render component tree in the "Components" panel.
- [x] Render component list in "My Blueprint" panel.
- [x] Implement drag-and-drop from "Components" panel to graph to create "Get Component" nodes.
- [x] Implement drag-and-drop from "My Blueprint" panel to graph.

### Phase 3: Details Panel Integration
7.  [ ] Update `DetailsController` to show Component properties.
8.  [ ] Implement `Transform` property widget.

### Phase 4: Component Nodes
9.  [ ] Register `Get` nodes for components.
