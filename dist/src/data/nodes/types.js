/**
 * @typedef {Object} PinDefinition
 * @property {string} id - Unique identifier for the pin
 * @property {string} name - Display name
 * @property {string} type - Pin type (exec, bool, int, float, string, etc.)
 * @property {'in'|'out'} dir - Direction of the pin
 * @property {*} [defaultValue] - Default value for input pins
 * @property {string} [containerType] - Container type for collections (array, set, map)
 */

/**
 * @typedef {Object} NodeDefinition
 * @property {string} title - Display title for the node
 * @property {string} type - Node type (event-node, function-node, pure-node, flow-node, etc.)
 * @property {string} category - Category for palette organization
 * @property {string} [executor] - Name of the executor to handle this node
 * @property {string} icon - Icon path or FontAwesome class
 * @property {PinDefinition[]} pins - Array of pin definitions
 * @property {Object} [customData] - Custom data for node configuration
 */

/**
 * @typedef {Object.<string, NodeDefinition>} NodeDefinitionMap
 */
