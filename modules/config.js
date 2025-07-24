export const AKREL = {};

/**
 * The set of Ability Scores used within the sytem.
 * @type {Object}
 */
// Définition des attributs si vous les utilisez pour les dropdowns
AKREL.attackTypes = {
    "SOC": "AKREL.ATTRIBUTES.SOC", // Ces valeurs sont les clés de localisation
    "PHY": "AKREL.ATTRIBUTES.PHY",
    "INT": "AKREL.ATTRIBUTES.INT",
    "ADR": "AKREL.ATTRIBUTES.ADR"
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