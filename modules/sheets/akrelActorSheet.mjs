/**
 * @extends {ActorSheet}
 * Représente la feuille de personnage pour l'acteur Akrel, gérant l'affichage
 * et les interactions pour les personnages joueurs et PNJ du système.
 */
export default class akrelActorSheet extends foundry.appv1.sheets.ActorSheet {

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
            scrollY: [".attributes", ".item-section"], // Permet le défilement dans les sections des attributs et des items
            dragDrop: [
                { dragSelector: ".draggable", dropSelector: ".sheet-body" }, // For internal reordering & external drops
            ],
        });
    }

    /**
     * Détermine dynamiquement le chemin du template Handlebars à utiliser pour la feuille,
     * en fonction du type de l'acteur (par exemple, "character-sheet.hbs" ou "npc-sheet.hbs").
     * @returns {string} Le chemin complet vers le template Handlebars.
     */
    get template() {
        const path = "systems/akrel/templates/sheets/actors/";
        return `${path}${this.actor.type}-sheet.hbs`;
    }

    /** @inheritdoc */
    getData() {
        const data = super.getData();
        data.system = data.actor.system;
        data.config = CONFIG.AKREL;
        this._prepareCharacterItems(data);
        return data;
    }

    /**
     * Organise et filtre les items de l'acteur par type pour les rendre accessibles dans le template.
     * Cette méthode est appelée par `getData`.
     * @param {object} actorData L'objet de données de l'acteur passé au template.
     * @private
     */
    _prepareCharacterItems(actorData) {
        const spells = [];
        const passives = [];
        const weapons = [];
        const armors = [];
        const loots = [];

        for (let i of actorData.actor.items) {
            switch (i.type) {
                case 'spell':
                    spells.push(i);
                    break;
                case 'passive':
                    passives.push(i);
                    break;
                case 'weapon':
                    weapons.push(i);
                    break;
                case 'armor':
                    armors.push(i);
                    break;
                case 'loot':
                    loots.push(i);
                    break;
                default:
                    console.warn(`AKREL | Item de type inconnu rencontré: ${i.type} (${i.name || "Sans nom"})`);
                    break;
            }
        }

        actorData.spells = spells.sort((a, b) => (a.sort || 0) - (b.sort || 0));
        actorData.passives = passives.sort((a, b) => (a.sort || 0) - (b.sort || 0));
        actorData.weapons = weapons.sort((a, b) => (a.sort || 0) - (b.sort || 0));
        actorData.armors = armors.sort((a, b) => (a.sort || 0) - (b.sort || 0));
        actorData.loots = loots.sort((a, b) => (a.sort || 0) - (b.sort || 0));

        console.log("AKREL | _prepareCharacterItems: Résumé des items préparés :", {
            spells: spells.length,
            passives: passives.length,
            weapons: weapons.length,
            armors: armors.length,
            loots: loots.length
        });
    }

    /** @inheritdoc */
    _onSortItem(event, itemData) {
        super._onSortItem(event, itemData);
    }

    /** @inheritdoc */
    activateListeners(html) {
        super.activateListeners(html);

        if (!this.options.editable) return;

        const textareas = html[0].querySelectorAll('textarea');
        
        textareas.forEach(textarea => {
            const autoResize = () => {
                textarea.style.height = 'auto';
                textarea.style.height = `${textarea.scrollHeight}px`;
            };
            autoResize();
            textarea.addEventListener('input', autoResize);
        });

        // Bouton pour le jet de stat (y compris l'initiative)
        html.find('.stat-roll').on('click', this._onStatRoll.bind(this));

        // Bouton de suppression des items
        html.find('.item-delete').click(this._onItemDelete.bind(this));

        // Bouton d'ajout de membre de groupe
        html.find(".add-group-member").click(async ev => {
            const currentMembers = this.actor.system.groupMembers || [];
            const newMember = { name: "", opinion: "" };
            
            await this.actor.update({
                "system.groupMembers": [...currentMembers, newMember]
            });
        });

        // Bouton de suppression de membre de groupe
        html.find('.group-member-delete').click(this._onGroupMemberDelete.bind(this));
        
         // Listener pour lancer un jet d'item
        html.find('.item-roll').click(ev => {
            const li = $(ev.currentTarget).parents(".item-row");
            const item = this.actor.items.get(li.data("itemId"));
            if (item) {
                if (typeof item.roll === 'function') {
                    item.roll(); 
                } else {
                    console.warn(`AKREL | L'item ${item.name} n'a pas de méthode 'roll()' définie.`);
                    ui.notifications.warn(`L'item ${item.name} ne peut pas être lancé.`);
                }
            } else {
                console.error("AKREL | Item non trouvé pour le jet.", li.data("itemId"));
            }
        });

        // Listener pour ouvrir la feuille d'un item
        html.find('.item-name-cell .item-img, .item-name-cell p').click(ev => {
            const li = $(ev.currentTarget).parents(".item-row");
            const item = this.actor.items.get(li.data("itemId"));
            if (item) {
                item.sheet.render(true);
            }
        });

        // Listener pour supprimer un item (avec confirmation)
        html.find('.item-delete').click(async ev => {
            const li = $(ev.currentTarget).parents(".item");
            const itemId = li.data("itemId");
            if (itemId) {
                const item = this.actor.items.get(itemId);
                if (item) {
                    const confirmDelete = await Dialog.confirm({
                        title: game.i18n.localize("AKREL.ACTIONS.DELETE_CONFIRM_TITLE"),
                        content: game.i18n.format("AKREL.ACTIONS.DELETE_CONFIRM_CONTENT", { name: item.name }),
                        yes: () => true,
                        no: () => false,
                        defaultYes: false
                    });

                    if (confirmDelete) {
                        await item.delete();
                        li.slideUp(200, () => this.render(false));
                    }
                }
            }
        });
    }

    /**
     * Gère les jets de statistiques, y compris l'initiative.
     * Déclenche la méthode rollStat de l'acteur.
     * @param {Event} event L'événement de clic du bouton.
     * @private
     */
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
            console.warn("AKREL | Impossible de déterminer l'index du membre du groupe à supprimer.");
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

    /**
     * @inheritdoc
     * Méthode de Foundry VTT qui se déclenche lorsque le formulaire est soumis.
     */
    async _updateObject(event, formData) {
        await super._updateObject(event, formData);
    }
}

/**
 * Hook Foundry VTT pour la mise à jour des tokens lors de la modification du nom de l'acteur.
 * Cette fonction est appelée chaque fois qu'un acteur est mis à jour.
 */
Hooks.on("updateActor", async (actor, changes, options, userId) => {
    if (!changes.name) {
        return;
    }

    for (const scene of game.scenes) {
        const token = scene.tokens.find(t => t.actorId === actor.id);
        if (token && token.name !== actor.name) {
            await scene.updateEmbeddedDocuments("Token", [{ _id: token.id, name: actor.name }]);
            console.log(`AKREL | Le nom du token ${token.id} a été mis à jour avec le nouveau nom de l'acteur : ${actor.name}`);
        }
    }
});
