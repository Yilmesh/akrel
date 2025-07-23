// systems/akrel/modules/config.js

export const akrel = {};

// Définition des attributs si vous les utilisez pour les dropdowns
akrel.attackTypes = {
    "SOC": "AKREL.ATTRIBUTES.SOC", // Ces valeurs sont les clés de localisation
    "PHY": "AKREL.ATTRIBUTES.PHY",
    "INT": "AKREL.ATTRIBUTES.INT",
    "ADR": "AKREL.ATTRIBUTES.ADR"
};

// =========================================================================
// CECI EST CRUCIAL POUR LA TRADUCTION DES TYPES D'ACTEURS ET D'ITEMS !
// =========================================================================
// Définir les chemins de localisation pour les noms de types d'acteurs
akrel.actorTypes = { // J'utilise ici akrel.actorTypes pour les regrouper sous un namespace propre
    "character": "AKREL.TYPES.Actor.character",
    "npc": "AKREL.TYPES.Actor.npc"
};

// Définir les chemins de localisation pour les noms de types d'items
akrel.itemTypes = { // J'utilise ici akrel.itemTypes pour les regrouper sous un namespace propre
    "weapon": "AKREL.TYPES.Item.weapon",
    "armor": "AKREL.TYPES.Item.armor",
    "loot": "AKREL.TYPES.Item.loot",
    "spell": "AKREL.TYPES.Item.spell",
    "passive": "AKREL.TYPES.Item.passive"
};