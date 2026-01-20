import { InterfaceDefinition } from "./InterfaceDefinition.js";

/**
 * InterfaceRegistry - Manages all Blueprint Interfaces.
 * Provides standard UE5 interfaces and allows custom interface registration.
 */
class InterfaceRegistryClass {
  constructor() {
    this.interfaces = new Map();
    this._initStandardInterfaces();
  }

  /**
   * Initialize standard UE5 interfaces
   */
  _initStandardInterfaces() {
    // IInteractable - For interactive actors
    const interactable = new InterfaceDefinition(
      "IInteractable",
      "Interface for actors that can be interacted with"
    );
    interactable.addFunction(
      "Interact",
      "Called when actor is interacted with",
      [{ name: "Interactor", type: "object", defaultValue: null }],
      [{ name: "Success", type: "bool" }]
    );
    interactable.addFunction(
      "CanInteract",
      "Check if interaction is possible",
      [{ name: "Interactor", type: "object", defaultValue: null }],
      [{ name: "CanInteract", type: "bool" }],
      true
    );
    interactable.addFunction(
      "GetInteractionText",
      "Get UI prompt text",
      [],
      [{ name: "Text", type: "string" }],
      true
    );
    this.register(interactable);

    // IDamageable - For actors that can take damage
    const damageable = new InterfaceDefinition(
      "IDamageable",
      "Interface for actors that can receive damage"
    );
    damageable.addFunction(
      "TakeDamage",
      "Apply damage to this actor",
      [
        { name: "Damage", type: "float", defaultValue: 0 },
        { name: "DamageType", type: "object", defaultValue: null },
        { name: "Instigator", type: "object", defaultValue: null },
      ],
      []
    );
    damageable.addFunction(
      "GetHealth",
      "Get current health",
      [],
      [{ name: "Health", type: "float" }],
      true
    );
    damageable.addFunction(
      "GetMaxHealth",
      "Get maximum health",
      [],
      [{ name: "MaxHealth", type: "float" }],
      true
    );
    damageable.addFunction(
      "IsDead",
      "Check if actor is dead",
      [],
      [{ name: "IsDead", type: "bool" }],
      true
    );
    this.register(damageable);

    // ISaveable - For actors that can be saved/loaded
    const saveable = new InterfaceDefinition(
      "ISaveable",
      "Interface for actors that support save/load"
    );
    saveable.addFunction(
      "Save",
      "Save actor state",
      [],
      [{ name: "SaveData", type: "object" }]
    );
    saveable.addFunction(
      "Load",
      "Load actor state",
      [{ name: "SaveData", type: "object", defaultValue: null }],
      [{ name: "Success", type: "bool" }]
    );
    this.register(saveable);

    // IPoolable - For object pooling
    const poolable = new InterfaceDefinition(
      "IPoolable",
      "Interface for actors that can be pooled"
    );
    poolable.addFunction(
      "OnActivateFromPool",
      "Called when retrieved from pool",
      [],
      []
    );
    poolable.addFunction(
      "OnReturnToPool",
      "Called when returned to pool",
      [],
      []
    );
    poolable.addFunction(
      "CanReturnToPool",
      "Check if can be returned",
      [],
      [{ name: "CanReturn", type: "bool" }],
      true
    );
    this.register(poolable);

    // IAnimNotify - For animation notify callbacks
    const animNotify = new InterfaceDefinition(
      "IAnimNotify",
      "Interface for animation notification receivers"
    );
    animNotify.addFunction(
      "OnAnimNotify",
      "Called on animation notify",
      [{ name: "NotifyName", type: "name", defaultValue: "" }],
      []
    );
    this.register(animNotify);

    // IGameplayTagAsset - For gameplay tag queries
    const tagAsset = new InterfaceDefinition(
      "IGameplayTagAsset",
      "Interface for actors with gameplay tags"
    );
    tagAsset.addFunction(
      "GetOwnedGameplayTags",
      "Get all owned tags",
      [],
      [{ name: "Tags", type: "object" }],
      true
    );
    tagAsset.addFunction(
      "HasMatchingGameplayTag",
      "Check for matching tag",
      [{ name: "Tag", type: "name", defaultValue: "" }],
      [{ name: "HasTag", type: "bool" }],
      true
    );
    this.register(tagAsset);
  }

  /**
   * Register an interface
   */
  register(interfaceDef) {
    this.interfaces.set(interfaceDef.name, interfaceDef);
  }

  /**
   * Unregister an interface
   */
  unregister(name) {
    this.interfaces.delete(name);
  }

  /**
   * Get interface by name
   */
  get(name) {
    return this.interfaces.get(name);
  }

  /**
   * Get all interfaces
   */
  getAll() {
    return Array.from(this.interfaces.values());
  }

  /**
   * Get all interface names
   */
  getAllNames() {
    return Array.from(this.interfaces.keys());
  }

  /**
   * Check if interface exists
   */
  has(name) {
    return this.interfaces.has(name);
  }

  /**
   * Get functions for a specific interface
   */
  getFunctions(interfaceName) {
    const iface = this.interfaces.get(interfaceName);
    return iface ? iface.functions : [];
  }

  /**
   * Clear all interfaces (except standard ones)
   */
  clearCustom() {
    const standardNames = [
      "IInteractable",
      "IDamageable",
      "ISaveable",
      "IPoolable",
      "IAnimNotify",
      "IGameplayTagAsset",
    ];
    for (const name of this.interfaces.keys()) {
      if (!standardNames.includes(name)) {
        this.interfaces.delete(name);
      }
    }
  }
}

// Singleton export
export const interfaceRegistry = new InterfaceRegistryClass();
