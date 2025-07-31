export const AKREL = {
    combatBonus: 20,

    /**
     * The set of Ability Scores used within the system.
     * @type {Object}
     */
    // Définition des attributs pour les dropdowns (Attack Types)
    attackTypes: {
        "SOCIAL": "AKREL.ATTRIBUTES.SOCIAL",
        "PHYSICAL": "AKREL.ATTRIBUTES.PHYSICAL",
        "INTELLIGENCE": "AKREL.ATTRIBUTES.INTELLIGENCE",
        "DEXTERITY": "AKREL.ATTRIBUTES.DEXTERITY"
    },

    // Définir les chemins de localisation pour les noms de types d'acteurs
    actorTypes: { 
        "character": "AKREL.TYPES.Actor.character",
        "npc": "AKREL.TYPES.Actor.npc"
    },

    // Définir les chemins de localisation pour les noms de types d'items
    itemTypes: {
        "weapon": "AKREL.TYPES.Item.weapon",
        "armor": "AKREL.TYPES.Item.armor",
        "loot": "AKREL.TYPES.Item.loot",
        "spell": "AKREL.TYPES.Item.spell",
        // Attention: 'passive' ici est un type d'item. Si c'est pour un spellType, il devrait être dans SpellDataModel.
        // Si c'est un type d'item à part entière qui apparaît dans la création d'item, alors c'est correct.
        "passive": "AKREL.TYPES.Item.passive" 
    },

    wornLocations: {
        "head": "AKREL.ITEM.HEAD",
        "chest": "AKREL.ITEM.CHEST",
        "arms": "AKREL.ITEM.ARMS",
        "pant": "AKREL.ITEM.LEGS",
        "feets": "AKREL.ITEM.FEETS"
    },

    defaultActorImages: {
        character: "systems/akrel/assets/icons/character-default.png",
        npc: "systems/akrel/assets/icons/npc-default.png",
        default: "systems/akrel/assets/icons/actor-default.png"
    }
};