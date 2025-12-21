/**
 * UI Panel Logic: Aggregator for individual UI controller modules.
 */

import { LayoutController } from './ui/LayoutController.js';
import { ContextMenu } from './ui/ContextMenu.js';
import { VariableController } from './ui/VariableController.js';
import { PaletteController } from './ui/PaletteController.js';
import { ActionMenu } from './ui/ActionMenu.js';
import { DetailsController } from './ui/DetailsController.js';
import { TaskController } from './ui/TaskController.js';
import { ComponentsController } from './ui/ComponentsController.js';
import { FunctionsController } from './ui/FunctionsController.js';
import { LocalVariablesController } from './ui/LocalVariablesController.js';
import { MacrosController } from './ui/MacrosController.js';
import { NeedNodeModal } from './ui/NeedNodeModal.js';
import { ParentClassModal } from './ui/ParentClassModal.js';
import { DebuggerController } from './ui/DebuggerController.js';

export {
    ActionMenu,
    ComponentsController,
    ContextMenu,
    DebuggerController,
    DetailsController,
    FunctionsController,
    LayoutController,
    LocalVariablesController,
    MacrosController,
    NeedNodeModal,
    ParentClassModal,
    PaletteController,
    TaskController,
    VariableController
};
export { GraphsController } from './ui/GraphsController.js';
export { EventDispatcherController } from './ui/EventDispatcherController.js';
