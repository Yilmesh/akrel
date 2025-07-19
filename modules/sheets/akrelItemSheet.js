// systems/akrel/module/sheets/akrelItemSheet.js

export default class akrelItemSheet extends ItemSheet {

    /** @inheritdoc */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["akrel", "sheet", "item"], // Classe CSS pour ta feuille
            // IMPORTANT : NE PAS DÉFINIR 'template' ICI si tu utilises 'get template()'
            // Foundry utilisera la méthode 'get template()' pour déterminer le bon fichier.
            width: 620,
            height: 350,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }],
            scrollY: [".attributes"], // Si tu as des éléments défilants
        });
    }

    /** @inheritdoc */
    // Cette méthode est cruciale pour choisir le bon template en fonction du type d'objet.
    get template() {
        // Le chemin de base vers tes templates de fiches d'objets
        const path = "systems/akrel/templates/sheets/items/"; // Assure-toi que c'est le bon dossier !

        // Récupère le type de l'objet (par exemple, "weapon", "armor", "spell", "loot")
        // et construis le chemin complet vers le fichier .hbs correspondant.
        // Par exemple, si item.type est "weapon", ça deviendra "systems/akrel/templates/item/weapon-sheet.hbs"
        return `${path}${this.item.type}-sheet.hbs`;
    }

    /** @inheritdoc */
    getData() {
        const data = super.getData();

        // Ajoute ici tes données de configuration si nécessaire
        data.config = CONFIG.akrel;

        return data;
    }

    /** @inheritdoc */
    activateListeners(html) {
        super.activateListeners(html);

        // Tu peux ajouter d'autres écouteurs d'événements ici si besoin.
        if ( !this.isEditable ) return;
    }
}