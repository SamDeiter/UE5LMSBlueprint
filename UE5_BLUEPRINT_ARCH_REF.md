# Unreal Engine 5 Blueprint Node Architecture: Technical Reference

## 1. Introduction to the Kismet Virtual Machine and Blueprint Ontology

The Unreal Engine 5 (UE5) Blueprint Visual Scripting system serves as a high-level abstraction layer over the engine’s C++ architecture, utilizing the Kismet Virtual Machine (VM) to execute logic defined by node graphs. This report provides an exhaustive technical analysis and catalog of the node ecosystem available within the Blueprint Editor.

The Blueprint architecture is not merely a visual representation of code but a distinct object-oriented environment where nodes represent discrete units of functionality. These nodes are derived from underlying C++ classes—primarily `UK2Node` for graph logic and `UBlueprintFunctionLibrary` for static utility exposure.

## 2. Execution Flow and Logic Control Nodes

Flow control nodes dictate the traversal of the execution wire, determining the order of operations based on logic evaluation.

### 2.1. Branching and Conditional Logic

- **Branch (The "If" Statement)**: Evaluates a boolean input (`Condition`) and bifurcates flow to `True` or `False`.
- **Select (Data Flow Control)**: A pure node that selects one output value from multiple inputs based on a selector index (Boolean, Index, or Enum).

### 2.2. Switch Nodes (State Routing)

Switch nodes route a single execution pulse based on an input value:

- **Switch on Int**: Numerical index matching.
- **Switch on String**: Case-sensitive text matching.
- **Switch on Name**: Hashed name matching (faster than String).
- **Switch on Enum**: Safest for gameplay logic; auto-updates with Enum assets.

### 2.3. Iteration and Looping (Standard Macros)

- **For Loop**: Iterates from First Index to Last Index.
- **For Loop with Break**: Termination capable iteration.
- **For Each Loop**: Designed for `TArray` containers.
- **While Loop**: Executes as long as a condition is true (Risk of infinite loops).

### 2.4. Sequence and Gate Control

- **Sequence**: Splits a pulse into multiple sequential steps. Fires Then 0, Then 1, etc., synchronously.
- **Gate**: Acts as a valve (Enter, Open, Close, Toggle).
- **Do N**: Limits execution to N times.
- **Do Once**: Specialized Do N (N=1).
- **MultiGate**: Multi-output router with optional looping/randomization.

## 3. The Kismet Math Library: Standard Node Catalog

UE5 utilizes Large World Coordinates (Double Precision) for math.

### 3.1. Floating Point (Scalar) Operations

Standard arithmetic (`+`, `-`, `*`, `/`, `%`), clamping, interpolation (`Lerp`, `FInterp To`), and range mapping.

### 3.2. Trigonometry and Geometry

`Sin`, `Cos`, `Tan`, `Atan2` (critical for rotation from direction), `Grid Snap`.

### 3.3. Vector Algebra (3D)

- **Dot Product**: Directional alignment check.
- **Cross Product**: Perpendicular vector calculation.
- **Vector Length / Length Squared**: Distance magnitude.
- **Normalize**: Scales to length 1.0.
- **Rotate / Unrotate**: Coordinate space transformations.

### 3.4. Rotator and Transform Math

- **Rotators**: Roll, Pitch, Yaw.
- **Transforms**: Location, Rotation, Scale.
- **Compose Transforms**: Hierarchical combination.
- **Transform Location**: Local to World conversion.

## 4. Gameplay Statics: The Engine Interface

- **Spawn Actor from Class**: Instantiates Actors.
- **Get All Actors of Class**: Computational expensive search.
- **Destroy Actor**: Trigger `Event End Play`.
- **Open Level**: Map travel.
- **World Delta Seconds**: Frame time.
- **Project World to Screen**: 3D to 2D UI coordinates.

## 5. Collision and Tracing Nodes

Tracing (Raycasting) queries the physics world.

- **Line Trace By Channel / Profile / Objects**: Raycast variants.
- **Box / Sphere / Capsule Trace**: Swept shape traces.
- **Hit Result**: Struct containing hit details (Location, Normal, Actor, etc.).

## 6. Input System: Enhanced Input

- **Input Action**: Primary event node (`Triggered`, `Started`, `Completed`, `Canceled`).
- **Mapping Context**: Assigns input sets to controllers.

## 7. Data Structures: Arrays, Sets, and Maps

- **Arrays**: Ordered list (`Add`, `Remove`, `Get`, `Length`).
- **Sets**: Unique items, fast existence checks (`Union`, `Intersection`).
- **Maps**: Key-Value dictionaries (`Find`, `Keys`, `Values`).

## 8. Utilities and Debugging

- **Format Text**: Variable injection using `{Var}` syntax.
- **Print String**: Screen/Log output (stripped in Shipping builds).
- **Draw Debug Line / Box / Sphere**: Geometric visualization.

## 9. Audio and Visual

- **Audio**: Play Sound 2D vs. at Location. MetaSound parameter updates.
- **Particles**: Niagara system spawning and variable injection.

## 10. Blueprint Communication

- **Casting**: Hard reference, type verification.
- **Interfaces**: Decoupled, silent-fail messaging.
- **Event Dispatchers**: Bind/Call subscription model.
