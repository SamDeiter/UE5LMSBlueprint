# Feature Plan: New Blueprint Creation Workflow

## Objective
Implement a "Pick Parent Class" modal that mimics the Unreal Engine 5 experience when creating a new Blueprint. This modal should appear when the user clicks "New Blueprint" (or potentially on first load if no graph exists), allowing them to select a parent class for their new Blueprint.

## 1. User Interface Design

### Modal Layout
The modal will match the visual style of the provided reference image:
- **Header**: "Pick Parent Class" with a close (X) button.
- **Common Classes Section**: A list of frequently used classes with large buttons and descriptions.
  - **Actor**: "An Actor is an object that can be placed or spawned in the world."
  - **Pawn**: "A Pawn is an actor that can be 'possessed' and receive input from a controller."
  - **Character**: "A character is a type of Pawn that includes the ability to walk around."
  - **Player Controller**: "A Player Controller is an actor responsible for controlling a Pawn used by the player."
  - **Game Mode Base**: "Game Mode Base defines the game being played, its rules, scoring, and other facets of the game type."
  - **Actor Component**: "An ActorComponent is a reusable component that can be added to any actor."
  - **Scene Component**: "A Scene Component is a component that has a scene transform and can be attached to other scene components."
- **All Classes Section**: An expandable section (accordion style) to search/list all available classes (for future expansion).
- **Footer**: A "Cancel" button.

### Styling
- Dark theme consistent with the existing editor.
- Hover effects on class buttons (lighter gray background).
- Help icons (?) next to descriptions (optional, for tooltips).

## 2. Implementation Details

### New Component: `ParentClassModal.js`
Create a new class `ParentClassModal` in `src/ui/` to handle the rendering and logic.

**Key Methods:**
- `open()`: Shows the modal.
- `close()`: Hides the modal.
- `selectClass(className)`: Handles the selection logic.

### Integration
- **Trigger**: Add a "New" button to the File menu or Toolbar (currently "Import/Export" exist, but "New" is implicit).
- **State Change**: When a class is selected:
  1.  Clear the current graph (`Persistence.loadDefaultGraph` logic but tailored).
  2.  Set the `ParentClass` property of the Blueprint (display this in the top-right "Parent class: Actor" label).
  3.  Populate the graph with default nodes relevant to the class (e.g., `Event BeginPlay`, `Event Tick` for Actors; maybe different defaults for Components).

## 3. Proposed Workflow

1.  **User Action**: User clicks "File > New Blueprint" (we need to add this menu item).
2.  **System Response**: `ParentClassModal` opens. Background is dimmed.
3.  **User Action**: User clicks "Actor".
4.  **System Response**:
    - Modal closes.
    - Graph is cleared.
    - "Parent class: Actor" is updated in the UI.
    - Default nodes (BeginPlay, Tick, Overlap) are added.
    - History is reset.

## 4. Technical Tasks

1.  [ ] Create `src/ui/ParentClassModal.js`.
2.  [ ] Add CSS for the modal in `src/css/modals.css` to match the reference image.
3.  [ ] Instantiate `ParentClassModal` in `BlueprintApp.init`.
4.  [ ] Update `index.html` to include the modal container (or generate it dynamically).
5.  [ ] Add "New Blueprint" option to the "File" dropdown in `index.html` / `ActionMenu.js` (if it controls the top bar).
6.  [ ] Implement logic to update the "Parent class" label in the top-right of the editor.

## 5. Open Questions
- Should this modal appear automatically on a fresh page load if no local storage data is found? (Recommendation: Yes, for a better "first run" experience).
- Do different parent classes actually change the available nodes in our current simulation engine? (Currently: No, but we can filter the Palette based on the selected class in the future).
