# UE5 Blueprint Visual Style Guide

## Overview
This document outlines the visual standards implemented to match the Unreal Engine 5 Blueprint Editor interface.

## 1. Node Styling

### General Appearance
- **Background:** Semi-transparent dark gray (`rgba(10, 10, 10, 0.45)`) with `backdrop-filter: blur(6px)`.
- **Border:** 1px black border + inner highlight (`rgba(255, 255, 255, 0.1)`).
- **Shadow:** Deep drop shadow (`0 10px 20px rgba(0,0,0,0.5)`).
- **Selection:** Golden Orange outline (`#F0B000`, 2px width).

### Event Nodes (`.node`)
- **Header:** Gradient Red (`#750000` to `#300000`).
- **Icon:** Diamond with Left Arrow (SVG).
- **Delegate:** Red hollow square on top right.

### SET Nodes (`.node.set-node`)
- **Header:** Centered, Italic, Bold text.
- **Header Gradient:**
  - Boolean: Red (`#8F0000`)
  - Object: Blue (`#005A8E`)
  - Float/Int: Green (`#38E056`)
- **Input Pins:** Arrow + Circle (O>).

### GET/Compact Nodes (`.node.compact-node`)
- **Shape:** Capsule (`border-radius: 50px`).
- **Background:** Dark gradient with sharp gloss overlay (top 50%).
- **Layout:** Text centered, Output pin on far right.
- **Sizing:** `width: max-content` to prevent stretching.

## 2. Pin Rendering

### Shapes (SVG)
- **Execution:** Wedge (`<path>`). White.
- **Data Input:** Circle (Left) + Arrow (Right).
- **Data Output:** Circle (Left) + Arrow (Right).

### Connection States
- **Connected:** Filled shape (`fill: currentColor`).
- **Unconnected:** Hollow shape (`fill: transparent`).
- **Logic:** Handled via `.connected` CSS class on the `.pin-icon` wrapper.

### Colors (CSS Variables)
- `bool`: Dark Red (`#920101`)
- `exec`: White (`#FFFFFF`)
- `float`: Neon Green (`#00EA32`)
- `vector`: Gold (`#FFC700`)
- `rotator`: Purple (`#9999FF`)
- `transform`: Orange (`#FF6600`)
- `object`: Cyan Blue (`#00A8E8`)

## 3. Editor Theme

- **Graph Background:** Dark Gray (`#262626`) with Grid Pattern.
- **Panels:** Darker Gray (`#151515`).
- **Typography:** Roboto/Inter, high contrast white text.
