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
import { preloadHandlebarsTemplates } from "./modules/helpers/templates.mjs";

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
    return preloadHandlebarsTemplates();
});