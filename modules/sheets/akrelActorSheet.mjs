/**
 * @extends {ActorSheet}
 * Représente la feuille de personnage pour l'acteur Akrel, gérant l'affichage
 * et les interactions pour les personnages joueurs et PNJ du système.
 */
export default class akrelActorSheet extends ActorSheet {

    /**
     * Retourne les options par défaut pour la feuille d'acteur.
     * @returns {Object} 
     */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["akrel", "sheet", "actor"],
            width: 800,
            height: 800,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "identity" }],
            scrollY: [".attributes", ".item-section"],
            dragDrop: [
                { dragSelector: ".draggable", dropSelector: ".sheet-body" },
            ],
        });
    }

    /**
     * Définit le template de la feuille d'acteur en fonction de son type.
     * @returns {string} Le chemin du template Handlebars.
     * @override
     */
    get template() {
        if (this.actor.type === 'character') {
            return "systems/akrel/templates/sheets/actors/character-sheet.hbs";
        } else if (this.actor.type === 'npc') {
            return "systems/akrel/templates/sheets/actors/npc-sheet.hbs";
        }
        // Par défaut, nous revenons au template de personnage
        return "systems/akrel/templates/sheets/actors/character-sheet.hbs";
    }

    /**
     * Prépare les données pour le template de la feuille de personnage.
     * @returns {Promise<Object>} Le contexte de données pour le template.
     * @override
     */
    async getData(options) {
        const context = await super.getData(options);
        
        context.actor = this.actor;
        context.system = this.actor.system;
        context.config = CONFIG.AKREL;
        
        this._prepareCharacterItems(context);
        
        return context;
    }

    /**
     * Attache les écouteurs d'événements à la feuille.
     * @param {JQuery} html Le contenu HTML de la feuille.
     * @override
     */
    activateListeners(html) {
        super.activateListeners(html);

        if (!this.options.editable) return;
        
        html.find('.stat-roll').on('click', this._onStatRoll.bind(this));
        html.find('.item-delete').on('click', this._onItemDelete.bind(this));
        html.find(".add-group-member").on('click', async ev => {
            const currentMembers = this.actor.system.groupMembers || [];
            const newMember = { name: "", opinion: "" };
            
            await this.actor.update({
                "system.groupMembers": [...currentMembers, newMember]
            });
        });
        html.find('.group-member-delete').on('click', this._onGroupMemberDelete.bind(this));
        html.find('.item-roll').on('click', ev => {
            const li = $(ev.currentTarget).parents(".item-row");
            const item = this.actor.items.get(li.data("itemId"));
            if (item) {
                if (typeof item.roll === 'function') {
                    item.roll(); 
                } else {
                    ui.notifications.warn(`L'item ${item.name} ne peut pas être lancé.`);
                }
            }
        });
        html.find('.item-name-cell .item-img, .item-name-cell p').on('click', ev => {
            const li = $(ev.currentTarget).parents(".item-row");
            const item = this.actor.items.get(li.data("itemId"));
            if (item) {
                item.sheet.render(true);
            }
        });
    }

    _prepareCharacterItems(context) {
        const spells = [];
        const passives = [];
        const weapons = [];
        const armors = [];
        const loots = [];

        for (const i of context.actor.items) {
            switch (i.type) {
                case 'spell': spells.push(i); break;
                case 'passive': passives.push(i); break;
                case 'weapon': weapons.push(i); break;
                case 'armor': armors.push(i); break;
                case 'loot': loots.push(i); break;
            }
        }

        context.spells = spells.sort((a, b) => (a.sort || 0) - (b.sort || 0));
        context.passives = passives.sort((a, b) => (a.sort || 0) - (b.sort || 0));
        context.weapons = weapons.sort((a, b) => (a.sort || 0) - (b.sort || 0));
        context.armors = armors.sort((a, b) => (a.sort || 0) - (b.sort || 0));
        context.loots = loots.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    }
    
    _onStatRoll(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const statKey = element.dataset.statKey;
        const statValue = parseInt(element.dataset.statValue, 10);
        this.actor.rollStat(statKey, statValue);
    }

    async _onItemDelete(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item-row");
        const itemId = li.data("item-id");
        const confirmed = await Dialog.confirm({
            title: game.i18n.localize("AKREL.DIALOG.CONFIRM_DELETE_TITLE"),
            content: game.i18n.localize("AKREL.DIALOG.CONFIRM_DELETE_CONTENT")
        });

        if (confirmed) {
            await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
            li.slideUp(200, () => this.render(false));
        }
    }

    async _onGroupMemberDelete(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".group-member-row");
        const index = li.data("member-index");
        if (index === undefined || index === null) {
            return;
        }

        const confirmed = await Dialog.confirm({
            title: game.i18n.localize("AKREL.DIALOG.CONFIRM_DELETE_GROUP_MEMBER_TITLE"),
            content: game.i18n.localize("AKREL.DIALOG.CONFIRM_DELETE_GROUP_MEMBER_CONTENT")
        });

        if (confirmed) {
            const groupMembers = [...this.actor.system.groupMembers];
            groupMembers.splice(index, 1);
            await this.actor.update({ "system.groupMembers": groupMembers });
        }
    }
}

Hooks.on("updateActor", async (actor, changes, options, userId) => {
    if (!changes.name) return;
    for (const scene of game.scenes) {
        const token = scene.tokens.find(t => t.actorId === actor.id);
        if (token && token.name !== actor.name) {
            await scene.updateEmbeddedDocuments("Token", [{ _id: token.id, name: actor.name }]);
        }
    }
});
