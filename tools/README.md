# Code Modification Tools

Python utilities for making structured code changes with minimal token overhead.

## Setup

No external dependencies required - uses Python standard library only.

```bash
# Ensure Python 3.7+ is installed
python --version
```

## Usage

### 1. Code Modifications

Create a JSON file describing your changes:

```json
{
  "description": "Add new node definition",
  "edits": [
    {
      "file": "data/NodeDefinitions.js",
      "action": "insert",
      "target": "object_key",
      "identifier": "Timeline",
      "position": "after",
      "payload": "    \"NewNode\": { ... },"
    }
  ]
}
```

Run the script:

```bash
# Dry run (preview changes)
python tools/code_mod.py changes.json --dry-run

# Apply changes
python tools/code_mod.py changes.json
```

### 2. Run Tests

```bash
python tools/run_tests.py
```

## Edit Actions

### Replace
Replace an existing code block:
```json
{
  "action": "replace",
  "target": "object_key",
  "identifier": "EventTick",
  "payload": "new code"
}
```

### Insert
Insert code before/after a target:
```json
{
  "action": "insert",
  "target": "object_key",
  "identifier": "Timeline",
  "position": "after",
  "payload": "new code"
}
```

### Delete
Remove a code block:
```json
{
  "action": "delete",
  "target": "object_key",
  "identifier": "OldNode"
}
```

## Target Types

- `object_key`: JavaScript object property (e.g., in NodeDefinitions)
- `case`: Switch case statement
- `text`: Simple text matching

## Benefits

- **Token Efficient**: Only JSON + diff output
- **Consistent**: Automated parsing reduces syntax errors
- **Traceable**: All changes logged with context
- **Scalable**: Bulk operations in single command
