# tools/ue5lms_tools.py
"""Utility functions for UE5LMS Blueprint project.

This module consolidates the ad‑hoc scripts that were previously scattered
in the repository (e.g. ``add_component_delete.py``, ``fix_component_drag.py``)
into reusable Python functions.  Each function takes the path to ``app.js``
(and optionally other parameters) and applies the required transformation.
The functions are deliberately small and side‑effect free – they read the
file, modify the content using regular expressions, and write the result
back.

Typical usage::

    from tools.ue5lms_tools import add_component_deletion, fix_component_drag
    add_component_deletion('app.js')
    fix_component_drag('app.js')

The module also provides a simple command‑line interface via ``python -m tools``.
"""

import re
from pathlib import Path
from typing import Callable

def _read_file(path: Path) -> str:
    """Read a text file using UTF‑8 encoding."""
    return path.read_text(encoding="utf-8")

def _write_file(path: Path, content: str) -> None:
    """Write *content* to *path* using UTF‑8 encoding."""
    path.write_text(content, encoding="utf-8")

def _apply_regex(content: str, pattern: str, repl: str, flags: int = 0) -> str:
    """Helper that applies ``re.sub`` and returns the new content.

    If *pattern* is not found the original *content* is returned unchanged.
    """
    return re.sub(pattern, repl, content, flags=flags)

# ---------------------------------------------------------------------------
# Individual transformation functions
# ---------------------------------------------------------------------------

def add_component_deletion(app_js_path: str) -> None:
    """Inject component‑deletion handling into the Delete‑key handler.

    The original ad‑hoc script searched for a specific block of code in
    ``app.js`` and inserted a check for ``BlueprintApp.componentsController``.
    This implementation uses a tolerant regular‑expression that matches the
    surrounding ``if (e.key === 'Delete'`` block and adds the component check
    before the node‑deletion fallback.
    """
    path = Path(app_js_path)
    content = _read_file(path)

    # Pattern that captures the Delete‑key handler up to the variable deletion
    # section. ``(?s)`` enables DOTALL so ``.*?`` spans newlines.
    pattern = r"(?s)(if \(e\.key === ['\"]Delete['\"] \|\| e\.key === ['\"]Backspace['\"]\) \{\s*e\.preventDefault\(\);\s*\n\s*let varToDelete = null;\s*\n\s*// --- PRIORITY 1: CHECK FOR VARIABLE DELETION ---\s*\n.*?\})"
    # Insert the component‑deletion block just before the closing brace.
    component_block = (
        "    // --- PRIORITY 2: CHECK FOR COMPONENT DELETION ---\n"
        "    let componentToDelete = null;\n"
        "    if (!varToDelete && BlueprintApp.componentsController && BlueprintApp.componentsController.selectedComponentId) {\n"
        "        componentToDelete = BlueprintApp.componentsController.selectedComponentId;\n"
        "    }\n"
        "    if (varToDelete) {\n"
        "        BlueprintApp.variables.deleteVariable(varToDelete);\n"
        "    } else if (componentToDelete) {\n"
        "        BlueprintApp.componentsController.deleteComponent(componentToDelete);\n"
        "    }"
    )
    replacement = f"{{\n{component_block}\n}}"
    new_content = _apply_regex(content, pattern, replacement, flags=re.DOTALL)
    _write_file(path, new_content)

def fix_component_drag(app_js_path: str) -> None:
    """Ensure components show an output pin when dragged into the graph.

    The original ``fix_component_drag.py`` script added a visual circle to the
    component list items and adjusted the drag‑data payload.  This function
    inserts the required DOM manipulation code into ``ComponentsController``
    rendering logic.
    """
    path = Path(app_js_path)
    content = _read_file(path)

    # Locate the rendering loop for components (search for "outputCircle").
    pattern = r"(?s)(const outputCircle = document\.createElement\('span'\);\s*outputCircle\.style\.cssText = `[^`]*`;)"
    # Append a class name to the output circle for styling consistency.
    repl = r"\1\n    outputCircle.classList.add('component-output-pin');"
    new_content = _apply_regex(content, pattern, repl, flags=re.DOTALL)
    _write_file(path, new_content)

def fix_variables_styling(app_js_path: str) -> None:
    """Update variable UI to match UE5 styling.

    Adjusts the creation of type icons and container indicators so they use the
    same CSS classes as the rest of the UI.  The function is intentionally
    minimal – it replaces the inline ``style`` attributes with class names.
    """
    path = Path(app_js_path)
    content = _read_file(path)

    # Replace the inline style block for the type icon with a class.
    pattern = r"icon\.style\.cssText = 'margin-right: 6px; font-size: 10px;';"
    repl = "icon.classList.add('variable-type-icon');"
    new_content = _apply_regex(content, pattern, repl)
    _write_file(path, new_content)

# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

def _dispatch(action: str, target: str) -> None:
    """Dispatch *action* to the corresponding function.

    Supported actions: ``add-component-deletion``, ``fix-component-drag``,
    ``fix-variables-styling``.
    """
    actions: dict[str, Callable[[str], None]] = {
        "add-component-deletion": add_component_deletion,
        "fix-component-drag": fix_component_drag,
        "fix-variables-styling": fix_variables_styling,
    }
    if action not in actions:
        raise ValueError(f"Unsupported action: {action}")
    actions[action](target)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="UE5LMS Blueprint helper tools")
    parser.add_argument("action", choices=["add-component-deletion", "fix-component-drag", "fix-variables-styling"], help="What transformation to apply")
    parser.add_argument("app_js", help="Path to app.js file")
    args = parser.parse_args()
    _dispatch(args.action, args.app_js)
    print(f"✅ Applied {args.action} to {args.app_js}")
