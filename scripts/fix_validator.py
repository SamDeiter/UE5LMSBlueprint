"""
Quick fix for NodeDefinitionValidator - add missing types
"""
import re

# Read the file
with open('src/utils/NodeDefinitionValidator.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace validNodeTypes
old_node_types = '''  static get validNodeTypes() {
    return ["event-node", "function-node", "pure-node", "macro-node"];
  }'''

new_node_types = '''  static get validNodeTypes() {
    return [
      "event-node", "function-node", "pure-node", "macro-node",
      // UE5-specific node types
      "flow-node", "cast-node", "variable-node", "assessment-node", "comment-node"
    ];
  }'''

content = content.replace(old_node_types, new_node_types)

# Replace validPinTypes
old_pin_types = '''  static get validPinTypes() {
    return [
      "exec", "bool", "int", "float", "byte", "string", "name",
      "vector", "rotator", "transform", "object", "struct",
      "linearcolor", "hitresult", "enum"
    ];
  }'''

new_pin_types = '''  static get validPinTypes() {
    return [
      "exec", "bool", "int", "float", "byte", "string", "name",
      "vector", "rotator", "transform", "object", "struct",
      "linearcolor", "hitresult", "enum",
      // UE5-specific types
      "wildcard", "class", "scenecomponent", "text", "int64"
    ];
  }'''

content = content.replace(old_pin_types, new_pin_types)

# Write back
with open('src/utils/NodeDefinitionValidator.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Updated NodeDefinitionValidator with UE5-specific types")
