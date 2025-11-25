# tools/ui.py
"""Simple Tkinter UI to run the UE5LMS helper tools.

The UI lets you:
  1. Choose the ``app.js`` file (or any target file).
  2. Select which transformation(s) to apply:
     - Add component deletion handling
     - Fix component drag output pin
     - Fix variable styling
  3. Execute the selected actions.

The underlying logic lives in ``tools/ue5lms_tools.py``.
"""

import tkinter as tk
from tkinter import filedialog, messagebox
from pathlib import Path

# Import the tool functions
from .ue5lms_tools import (
    add_component_deletion,
    fix_component_drag,
    fix_variables_styling,
)


def _run_actions(app_js_path: str, actions: list[str]):
    """Run the selected actions on *app_js_path*.

    ``actions`` is a list containing any of:
        "add_component_deletion",
        "fix_component_drag",
        "fix_variables_styling"
    """
    for act in actions:
        if act == "add_component_deletion":
            add_component_deletion(app_js_path)
        elif act == "fix_component_drag":
            fix_component_drag(app_js_path)
        elif act == "fix_variables_styling":
            fix_variables_styling(app_js_path)
        else:
            raise ValueError(f"Unknown action: {act}")


def main():
    root = tk.Tk()
    root.title("UE5LMS Blueprint Tools")
    root.geometry("400x300")

    # File selection
    file_frame = tk.Frame(root)
    file_frame.pack(pady=10, fill="x", padx=10)
    tk.Label(file_frame, text="app.js path:").pack(side="left")
    file_var = tk.StringVar()
    file_entry = tk.Entry(file_frame, textvariable=file_var, width=30)
    file_entry.pack(side="left", padx=5)

    def browse_file():
        path = filedialog.askopenfilename(
            title="Select app.js",
            filetypes=[("JavaScript files", "*.js"), ("All files", "*.*")],
        )
        if path:
            file_var.set(path)

    browse_btn = tk.Button(file_frame, text="Browse", command=browse_file)
    browse_btn.pack(side="left")

    # Action checkboxes
    actions_frame = tk.LabelFrame(root, text="Select actions")
    actions_frame.pack(pady=10, fill="both", expand=True, padx=10)

    var_add_del = tk.BooleanVar()
    var_fix_drag = tk.BooleanVar()
    var_fix_vars = tk.BooleanVar()

    tk.Checkbutton(
        actions_frame,
        text="Add component deletion handling",
        variable=var_add_del,
    ).pack(anchor="w", pady=2)
    tk.Checkbutton(
        actions_frame,
        text="Fix component drag output pin",
        variable=var_fix_drag,
    ).pack(anchor="w", pady=2)
    tk.Checkbutton(
        actions_frame,
        text="Fix variable styling",
        variable=var_fix_vars,
    ).pack(anchor="w", pady=2)

    # Run button
    def run_selected():
        path = file_var.get().strip()
        if not path:
            messagebox.showerror("Error", "Please select the app.js file.")
            return
        if not Path(path).exists():
            messagebox.showerror("Error", f"File not found: {path}")
            return
        selected_actions = []
        if var_add_del.get():
            selected_actions.append("add_component_deletion")
        if var_fix_drag.get():
            selected_actions.append("fix_component_drag")
        if var_fix_vars.get():
            selected_actions.append("fix_variables_styling")
        if not selected_actions:
            messagebox.showwarning("No action", "Please select at least one action.")
            return
        try:
            _run_actions(path, selected_actions)
            messagebox.showinfo("Success", f"Applied: {', '.join(selected_actions)}")
        except Exception as e:
            messagebox.showerror("Error", f"An error occurred: {e}")

    run_btn = tk.Button(root, text="Run", command=run_selected, bg="#4CAF50", fg="white")
    run_btn.pack(pady=10)

    root.mainloop()

if __name__ == "__main__":
    main()
