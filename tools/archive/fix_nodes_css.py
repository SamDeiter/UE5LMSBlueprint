import os

css_dir = os.path.join(os.getcwd(), 'css')
backup_file = os.path.join(css_dir, 'nodes.css.backup')
target_file = os.path.join(css_dir, 'nodes.css')

# CSS to append
additional_css = """
/* --- ADDED FIXES --- */
.pin-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    min-height: 24px;
    padding: 2px 0;
}

.event-delegate-icon {
    width: 12px;
    height: 12px;
    background-color: #ff4444;
    border: 1px solid #333;
    border-radius: 3px;
    margin-left: auto;
    box-shadow: inset 0 0 4px rgba(0,0,0,0.5);
}
"""

try:
    # Read backup file
    if os.path.exists(backup_file):
        with open(backup_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Write to target file with appended CSS
        with open(target_file, 'w', encoding='utf-8') as f:
            f.write(content + "\n" + additional_css)
        
        print(f"Successfully restored {target_file} from backup and appended fixes.")
    else:
        print(f"Error: Backup file {backup_file} not found.")

except Exception as e:
    print(f"An error occurred: {e}")
