import { akrel } from "./modules/config.js";
import akrelItemSheet from "./modules/sheets/akrelItemSheet.js";
import akrelActorSheet from "./modules/sheets/akrelActorSheet.js";

Hooks.once("init", function () {
    console.log("AKREL | Initialising Akrel System");

    CONFIG.akrel = akrel;

    // On retire les feuilles d'objets par défaut
    Items.unregisterSheet("core", ItemSheet);
    // On enregistre notre feuille personnalisée
    Items.registerSheet("akrel", akrelItemSheet, { makeDefault: true });

    // On retire les feuilles d'acteurs par défaut
    Actors.unregisterSheet("core", ActorSheet);
    // On enregistre notre feuille personnalisée
    Actors.registerSheet("akrel", akrelActorSheet, { makeDefault: true });
});