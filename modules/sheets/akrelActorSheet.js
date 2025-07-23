// systems/akrel/module/sheets/akrelActorSheet.js
/**
 * @extends {ActorSheet}
 */
export default class akrelActorSheet extends ActorSheet {

    /** @inheritdoc */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["akrel", "sheet", "actor"], 
            // IMPORTANT : NE PAS DÉFINIR 'template' ICI si tu utilises 'get template()'
            width: 800,
            height: 700, 
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "identity" }], // OK
            scrollY: [".attributes"], 
            dragDrop: [{dragSelector: ".draggable", dropSelector: null}],
        });
    }

    /** @inheritdoc */
    // Cette méthode est cruciale pour choisir le bon template en fonction du type d'objet/acteur.
    get template() {
        // Le chemin de base vers tes templates de fiches d'acteurs
        const path = "systems/akrel/templates/sheets/actors/"; 

        return `${path}${this.actor.type}-sheet.hbs`; 
    }

    /** @inheritdoc */
    getData() {
        // Pour ActorSheet, il est plus courant de passer un objet 'actor' et 'system'
        const data = super.getData();

        // Récupère l'acteur
        data.actor = this.actor;
        // Récupère les données propres au système de l'acteur (pour v10+ c'est .system, avant c'était .data)
        data.system = this.actor.system; // Si v10+, sinon data.data = this.actor.data;

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