export const AKREL = {};

/**
 * The set of Ability Scores used within the sytem.
 * @type {Object}
 */
// Définition des attributs si vous les utilisez pour les dropdowns
AKREL.attackTypes = {
    "SOCIAL": "AKREL.ATTRIBUTES.SOCIAL", // Ces valeurs sont les clés de localisation
    "PHYSICAL": "AKREL.ATTRIBUTES.PHYSICAL",
    "INTELLIGENCE": "AKREL.ATTRIBUTES.INTELLIGENCE",
    "DEXTERITY": "AKREL.ATTRIBUTES.DEXTERITY"
};

// Définir les chemins de localisation pour les noms de types d'acteurs
AKREL.actorTypes = { 
    "character": "AKREL.TYPES.Actor.character",
    "npc": "AKREL.TYPES.Actor.npc"
};

// Définir les chemins de localisation pour les noms de types d'items
AKREL.itemTypes = {
    "weapon": "AKREL.TYPES.Item.weapon",
    "armor": "AKREL.TYPES.Item.armor",
    "loot": "AKREL.TYPES.Item.loot",
    "spell": "AKREL.TYPES.Item.spell",
    "passive": "AKREL.TYPES.Item.passive"
};

AKREL.wornLocations = {
    "head": "AKREL.ITEM.HEAD",
    "chest": "AKREL.ITEM.CHEST",
    "arms": "AKREL.ITEM.ARMS",
    "pant": "AKREL.ITEM.LEGS",
    "feets": "AKREL.ITEM.FEETS"
};

AKREL.defaultActorImages = {
    character: "systems/akrel/assets/icons/character-default.png",
    npc: "systems/akrel/assets/icons/npc-default.png",
    default: "systems/akrel/assets/icons/actor-default.png"
};