import { AKREL } from "./modules/config.mjs";

import akrelItemSheet from "./modules/sheets/akrelItemSheet.mjs";
import akrelActorSheet from "./modules/sheets/akrelActorSheet.mjs";

import { SpellDataModel } from "./models/spell-data-model.mjs";
import { CharacterDataModel } from "./models/character-data-model.mjs";
import { NPCDataModel } from "./models/npc-data-model.mjs";
import { WeaponDataModel } from "./models/weapon-data-model.mjs";
import { ArmorDataModel } from "./models/armor-data-model.mjs";
import { LootDataModel } from "./models/loot-data-model.mjs";
import { PassiveDataModel } from "./models/passive-data-model.mjs";

import { AKRELActor } from "./modules/documents/actor.mjs";
import { AKRELItem } from "./modules/documents/item.mjs";

import { registerHandlebarsHelpers } from "./modules/helpers/registerHandlebarsHelper.mjs";

Hooks.once("init", async function () {
    game.akrel = {
        applications: {
            akrelItemSheet,
            akrelActorSheet,
        },
        documents:{
            AKRELActor,
            AKRELItem,
        }
    };
    
    CONFIG.AKREL = AKREL;

    /**
     * Set an initiative formula for the system
     * @type {String}
     */
    CONFIG.Combat.initiative = {
        formula: "0",
        decimals: 2
    };

    CONFIG.Actor.documentClass = AKRELActor;
    CONFIG.Item.documentClass = AKRELItem;

    foundry.documents.collections.Actors.registerSheet("akrel", akrelActorSheet, { makeDefault: true });
    foundry.documents.collections.Items.registerSheet("akrel", akrelItemSheet, { makeDefault: true });
    
    Handlebars.registerHelper('isType', function(type, compare) {
        const result = type === compare ? true : false;
        return result;
    });

    Handlebars.registerHelper('gt', function(a,b) {
        return a > b;
    });

    Handlebars.registerHelper('lt', function(a,b) {
        return a < b;
    });

    Handlebars.registerHelper('subtract', function(a,b) {
        return a - b;
    });

    registerHandlebarsHelpers();

    console.log("AKREL | Initialising Akrel System");
    
    // Fournit le tableau de chemins de modèles à loadTemplates.
    // Tous les modèles de feuilles de personnages, d'objets, de cartes de chat et de dialogues sont maintenant inclus.
    return foundry.applications.handlebars.loadTemplates([
        "systems/akrel/templates/sheets/actors/character-sheet.hbs",
        "systems/akrel/templates/sheets/actors/npc-sheet.hbs",
        "systems/akrel/templates/sheets/items/weapon-sheet.hbs",
        "systems/akrel/templates/sheets/items/loot-sheet.hbs",
        "systems/akrel/templates/sheets/items/passive-sheet.hbs",
        "systems/akrel/templates/sheets/items/armor-sheet.hbs",
        "systems/akrel/templates/sheets/items/spell-sheet.hbs",
        "systems/akrel/templates/chat/roll-chat-card.hbs",
        "systems/akrel/templates/chat/stat-roll-chat-card.hbs",
        "systems/akrel/templates/dialogs/item-roll-dialog.hbs",
        "systems/akrel/templates/dialogs/stat-roll-dialog.hbs"
    ]);
});
