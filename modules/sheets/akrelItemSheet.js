import { AKREL } from "../config.js"; 

export default class akrelItemSheet extends ItemSheet {

    /** @inheritdoc */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["akrel", "sheet", "item"],
            width: 620,
            height: 500,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }],
            scrollY: [".attributes"],
        });
    }

    /** @inheritdoc */
    get template() {
        const path = "systems/akrel/templates/sheets/items/";
        return `${path}${this.item.type}-sheet.hbs`;
    }

    /** @inheritdoc */
    getData() {
        const data = super.getData();
        data.config = CONFIG.AKREL; 
        data.system = data.item.system;

        return data;
    }

    /** @inheritdoc */
    activateListeners(html) {
        super.activateListeners(html);

        if ( !this.isEditable ) return;

        // Ajoutez ici vos écouteurs d'événements (boutons, etc.)
        // Exemple pour le bouton de dé (si vous en avez un)
        // html.find('.roll-damage').click(this._onRollDamage.bind(this));
    }

    // Définissez ici vos méthodes d'écouteurs, ex: _onRollDamage(event) { ... }
}