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
        
        // S'assure que groupMembers est toujours un tableau pour une utilisation correcte dans le template
        if (context.system.groupMembers && !Array.isArray(context.system.groupMembers)) {
            context.system.groupMembers = Object.values(context.system.groupMembers);
        }

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
        
        html.find(".add-group-member").on('click', this._onGroupMemberAdd.bind(this));
        
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

        // NOUVEAU: Écouteur pour l'ouverture de l'éditeur de texte riche en pop-up
        html.find('.editor-edit-button').on('click', this._onOpenRichTextEditor.bind(this));

        // NOUVEAU: Redimensionnement des textareas, en ignorant celles qui sont des prévisualisations d'éditeur
        this._resizeNonEditorTextareas(html);
        html.find('textarea:not(.editor-content-preview)').on('input', this._onNonEditorTextareaInput.bind(this));
    }

    /**
     * Gère l'événement de clic pour ouvrir l'éditeur de texte riche dans une pop-up.
     * @param {Event} event L'événement de clic.
     * @private
     */
    async _onOpenRichTextEditor(event) {
        event.preventDefault();
        const button = $(event.currentTarget);
        const fieldName = button.data("edit-field"); // Ex: "system.story"

        // Récupérer le contenu actuel de la field
        const currentContent = foundry.utils.getProperty(this.actor, fieldName) || "";

        // Ouvrir l'éditeur de texte riche de Foundry
        // activateEditor est une méthode de la classe parente ActorSheet
        this.activateEditor(fieldName, {
            element: button.closest('.editor-container').find('.editor-content-preview')[0], // Élément visuel de référence
            save_callback: async (editorName, htmlContent) => {
                // Callback qui sera appelé lorsque l'éditeur est sauvegardé
                await this.actor.update({ [editorName]: htmlContent });
                // Re-rendre la feuille pour que la textarea de prévisualisation soit mise à jour
                this.render(false); 
            },
            // Options supplémentaires pour TinyMCE si nécessaire
            tinymce: {
                menubar: false,
                toolbar: "undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
                height: 400
            }
        });
    }
    
    /**
     * Gère l'événement d'entrée sur les textareas non-éditeurs pour le redimensionnement.
     * @param {Event} event L'événement d'entrée.
     * @private
     */
    _onNonEditorTextareaInput(event) {
        event.target.style.height = 'auto';
        event.target.style.height = (event.target.scrollHeight) + 'px';
    }

    /**
     * Redimensionne toutes les textareas de la feuille qui ne sont pas des prévisualisations d'éditeur.
     * @param {JQuery} html Le contenu HTML de la feuille.
     * @private
     */
    _resizeNonEditorTextareas(html) {
        html.find('textarea:not(.editor-content-preview)').each((index, el) => {
            el.style.height = 'auto';
            el.style.height = (el.scrollHeight) + 'px';
        });
    }

    /**
     * Prépare et trie les objets de l'acteur par catégorie.
     * @param {object} context Le contexte de données du template.
     * @private
     */
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
    
    /**
     * Gère le lancement d'un jet de dé pour une statistique.
     * @param {Event} event L'événement de clic.
     * @private
     */
    _onStatRoll(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const statKey = element.dataset.statKey;
        const statValue = parseInt(element.dataset.statValue, 10);
        this.actor.rollStat(statKey, statValue);
    }

    /**
     * Gère la suppression d'un objet.
     * @param {Event} event L'événement de clic.
     * @private
     */
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

    /**
     * Gère le clic pour l'ajout d'un membre de groupe.
     * @param {Event} event L'événement de clic.
     * @private
     */
    async _onGroupMemberAdd(event) {
        event.preventDefault();

        const currentMembers = Array.isArray(this.actor.system.groupMembers)
            ? [...this.actor.system.groupMembers]
            : Object.values(this.actor.system.groupMembers || {});
        
        const newMember = { name: "", opinion: "" };
        
        await this.actor.update({
            "system.groupMembers": [...currentMembers, newMember]
        });
    }

    /**
     * Gère la suppression d'un membre de groupe.
     * @param {Event} event L'événement de clic.
     * @private
     */
    async _onGroupMemberDelete(event) {
        event.preventDefault();
        
        const indexString = $(event.currentTarget).data("index");
        const index = parseInt(indexString, 10);

        if (isNaN(index)) {
            ui.notifications.error("L'index de suppression du membre de groupe n'est pas valide.");
            return;
        }

        const confirmed = await Dialog.confirm({
            title: game.i18n.localize("AKREL.DIALOG.CONFIRM_DELETE_GROUP_MEMBER_TITLE"),
            content: game.i18n.localize("AKREL.DIALOG.CONFIRM_DELETE_GROUP_MEMBER_CONTENT")
        });

        if (confirmed) {
            const groupMembers = Array.isArray(this.actor.system.groupMembers)
                ? [...this.actor.system.groupMembers]
                : Object.values(this.actor.system.groupMembers || {});
            
            if (index >= 0 && index < groupMembers.length) {
                groupMembers.splice(index, 1);
                await this.actor.update({ "system.groupMembers": groupMembers });
            } else {
                ui.notifications.error("L'index de suppression du membre de groupe est hors de portée.");
            }
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
