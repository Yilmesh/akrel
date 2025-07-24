// systems/akrel/modules/helpers/templates.js
export const preloadHandlebarsTemplates = async function() {
    const templatePaths = [
        // Feuilles d'acteurs
        "systems/akrel/templates/sheets/actors/character-sheet.hbs",
        "systems/akrel/templates/sheets/actors/npc-sheet.hbs",
        // Feuilles d'items
        "systems/akrel/templates/sheets/items/weapon-sheet.hbs",
        "systems/akrel/templates/sheets/items/armor-sheet.hbs",
        "systems/akrel/templates/sheets/items/loot-sheet.hbs",
        "systems/akrel/templates/sheets/items/spell-sheet.hbs",
        "systems/akrel/templates/sheets/items/passive-sheet.hbs",
        // Tout autre template utilisé (dialogues, messages de chat, etc.)
        // Par exemple, si vous avez des templates pour des messages de chat de jet de dés
        // "systems/akrel/templates/chat/roll-message.hbs",
    ];
    return loadTemplates(templatePaths);
};