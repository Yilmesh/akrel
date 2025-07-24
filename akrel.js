import { AKREL } from "./modules/config.js";

import akrelItemSheet from "./modules/sheets/akrelItemSheet.js";
import akrelActorSheet from "./modules/sheets/akrelActorSheet.js";

import { SpellDataModel } from "./models/spell-data-model.js";
import { CharacterDataModel } from "./models/character-data-model.js";
import { NPCDataModel } from "./models/npc-data-model.js";
import { WeaponDataModel } from "./models/weapon-data-model.js";
import { ArmorDataModel } from "./models/armor-data-model.js";
import { LootDataModel } from "./models/loot-data-model.js";
import { PassiveDataModel } from "./models/passive-data-model.js";

import { AKRELActor } from "./modules/documents/actor.js";
import { AKRELItem } from "./modules/documents/item.js";
import { preloadHandlebarsTemplates } from "./modules/helpers/templates.js";

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

    Actors.unregisterSheet("core", ActorSheet);
    Items.unregisterSheet("core", ItemSheet);

    CONFIG.Actor.dataModels = {
        character:CharacterDataModel,
        npc:NPCDataModel,
    }

    CONFIG.Item.dataModels = {
        weapon:WeaponDataModel,
        armor:ArmorDataModel,
        loot:LootDataModel,
        spell:SpellDataModel,
        passive:PassiveDataModel
    }

    Actors.registerSheet("akrel", akrelActorSheet, { makeDefault: true });
    Items.registerSheet("akrel", akrelItemSheet, { makeDefault: true });
   
    Handlebars.registerHelper('isType', function(type, compare) {
        const result = type === compare ? true : false;
        return result;
    });

    console.log("AKREL | Initialising Akrel System");
    return preloadHandlebarsTemplates();
});