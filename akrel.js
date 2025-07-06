import { akrel } from "./modules/config.js";
import akrelItemSheet from "./modules/sheets/akrelItemSheet.js";

Hooks.once("init", function () {
    console.log("AKREL | Initialising Akrel System");

    CONFIG.akrel = akrel;

    // On retire les feuilles d'objets par défaut
    Items.unregisterSheet("core", ItemSheet);
    // On enregistre notre feuille personnalisée
    Items.registerSheet("akrel", akrelItemSheet, { makeDefault: true });
});