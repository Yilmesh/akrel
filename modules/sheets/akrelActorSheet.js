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
            scrollY: [".attributes", ".item-section"], // Permet le défilement dans les sections des attributs et des items
            dragDrop: [
                { dragSelector: ".draggable", dropSelector: ".sheet-body" }, // For internal reordering & external drops
                { dragSelector: ".item-list .item", dropSelector: null } // This line is for dragging items OUT of the sheet, if needed
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
        // Appelle la méthode getData de la classe parente (ActorSheet) pour obtenir les données de base.
        const data = super.getData();

        // Récupère les données brutes du système de l'acteur et les ajoute à l'objet 'data' sous 'system'.
        // C'est la source de vérité pour toutes les données de l'acteur.
        data.system = data.actor.system;

        // Ajoute l'objet de configuration global (CONFIG.AKREL) à l'objet de données de la feuille.
        // Cela rend les traductions, les listes de types (comme les types d'attaque), etc., disponibles dans le template Handlebars.
        data.config = CONFIG.AKREL;

        // Prépare et organise les items de l'acteur en fonction de leur type (sorts, passifs, etc.).
        // Les items sont ensuite ajoutés à 'data' pour être facilement accessibles dans le template.
        this._prepareCharacterItems(data);

        // Retourne l'objet de données complet, qui sera fusionné avec le contexte du template Handlebars.
        return data;
    }

    /**
     * Organise et filtre les items de l'acteur par type pour les rendre accessibles dans le template.
     * Cette méthode est appelée par `getData`.
     * @param {object} actorData L'objet de données de l'acteur passé au template.
     * @private
     */
    _prepareCharacterItems(actorData) {
        // Initialise des tableaux vides pour chaque type d'item.
        const spells = [];
        const passives = [];
        const weapons = [];
        const armors = [];
        const loots = [];

        // Itère sur tous les items de l'acteur.
        for (let i of actorData.actor.items) {
            // Utilise une instruction switch pour catégoriser chaque item en fonction de son type.
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

        // Assigne les listes d'items filtrées et triées par la propriété 'sort' à l'objet acteur.
        actorData.spells = spells.sort((a, b) => (a.sort || 0) - (b.sort || 0));
        actorData.passives = passives.sort((a, b) => (a.sort || 0) - (b.sort || 0));
        actorData.weapons = weapons.sort((a, b) => (a.sort || 0) - (b.sort || 0));
        actorData.armors = armors.sort((a, b) => (a.sort || 0) - (b.sort || 0));
        actorData.loots = loots.sort((a, b) => (a.sort || 0) - (b.sort || 0));

        // Logs de vérification des items préparés (à retirer en production ou à mettre sous un drapeau de débogage).
        console.log("AKREL | _prepareCharacterItems: Résumé des items préparés :", {
            spells: spells.length,
            passives: passives.length,
            weapons: weapons.length,
            armors: armors.length,
            loots: loots.length
        });
    }
    
    // In systems/akrel/sheets/akrelActorSheet.js
    /** @inheritdoc */
    _onSortItem(event, itemData) {
        // This calls Foundry's default item sorting logic.
        // It will calculate new 'sort' values based on where the item is dropped
        // within the list and update the item's data in the database.
        super._onSortItem(event, itemData);
    }

    /** @inheritdoc */
    activateListeners(html) {
        super.activateListeners(html);

        // Tout ce qui suit est géré par le formulaire natif ou un gestionnaire d'événements personnalisé.
        // Gérer les boutons d'ajout/suppression de membre de groupe.
        // Ils ne sont pas gérés par le _updateObject car ils déclenchent un update direct.


        // Bouton de suppression des items dans les listes d'objets.
        html.find('.item-delete').click(this._onItemDelete.bind(this));

        // Écouteur pour le bouton d'ajout de membre de groupe
        html.find(".add-group-member").click(async ev => {
            const currentMembers = this.actor.system.groupMembers || [];
            const newMember = { name: "", opinion: "" };
            
            await this.actor.update({
                "system.groupMembers": [...currentMembers, newMember]
            });

            console.log("AKREL | After adding group member (button click), actor.system.caracs.initiative:", this.actor.system.caracs.initiative);
        });

        // Supprimer un membre du groupe
        html.find('.group-member-delete').click(this._onGroupMemberDelete.bind(this)); // Premier écouteur, correct
        
        // Listeners pour les jets d'items (ex: jet de dés d'une arme)
        html.find('.item-roll').click(ev => {
            const li = $(ev.currentTarget).parents(".item");
            const item = this.actor.items.get(li.data("itemId"));
            if (item) {
                // Si l'item a une méthode 'roll' (comme les armes ou sorts avec jet de dégâts)
                if (typeof item.roll === 'function') {
                    item.roll();
                } else {
                    // Sinon, affiche simplement l'item
                    item.sheet.render(true);
                }
            }
        });

        // Listener pour ouvrir la feuille d'item
        html.find('.item-edit').click(ev => {
            const li = $(ev.currentTarget).parents(".item");
            const item = this.actor.items.get(li.data("itemId"));
            item.sheet.render(true);
        });

        // Listener pour supprimer un item
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
                        li.slideUp(200, () => this.render(false)); // Retire visuellement l'item et rafraîchit
                    }
                }
            }
        });
    }

    async _onItemDelete(event) {
        event.preventDefault(); // Empêche le comportement par défaut du lien
        const li = $(event.currentTarget).parents(".item-row"); // Trouve l'élément <li> parent de l'item
        const itemId = li.data("item-id"); // Récupère l'ID de l'item à partir de l'attribut data-item-id

        // Demander confirmation avant de supprimer (bonne pratique)
        const confirmed = await Dialog.confirm({
            title: game.i18n.localize("AKREL.DIALOG.CONFIRM_DELETE_TITLE"), // Titre du dialogue (à traduire dans vos locales)
            content: game.i18n.localize("AKREL.DIALOG.CONFIRM_DELETE_CONTENT") // Contenu du dialogue (à traduire)
        });

        if (confirmed) {
            await this.actor.deleteEmbeddedDocuments("Item", [itemId]); // Supprime l'item de l'acteur
            li.slideUp(200, () => this.render(false)); // Animation de disparition et rafraîchissement doux de la feuille
        }
    }

    async _onGroupMemberDelete(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".group-member-row"); // Remonte au conteneur du membre
        const index = li.data("member-index"); // Récupère l'index du membre à partir du HTML

        if (index === undefined || index === null) {
            console.warn("AKREL | Impossible de déterminer l'index du membre du groupe à supprimer.");
            return;
        }

        // Demander confirmation avant de supprimer
        const confirmed = await Dialog.confirm({
            title: game.i18n.localize("AKREL.DIALOG.CONFIRM_DELETE_GROUP_MEMBER_TITLE"),
            content: game.i18n.localize("AKREL.DIALOG.CONFIRM_DELETE_GROUP_MEMBER_CONTENT")
        });

        if (confirmed) {
            // Crée une copie mutable du tableau des membres du groupe
            const groupMembers = [...this.actor.system.groupMembers];
            
            // Supprime le membre à l'index donné
            groupMembers.splice(index, 1);

            // Met à jour l'acteur avec le nouveau tableau de membres
            // Foundry gérera le rafraîchissement de la feuille
            await this.actor.update({ "system.groupMembers": groupMembers });

            // Optionnel : Animation de disparition, Foundry rafraîchira la feuille automatiquement.
            // li.slideUp(200, () => this.render(false)); 
        }
    }

    /**
     * Gère la soumission du formulaire de la feuille d'acteur.
     * Cette méthode est appelée automatiquement lorsque le formulaire est soumis (ex: on change ou on blur des champs de formulaire).
     * @param {Event} event L'événement de soumission du formulaire.
     * @param {Object} formData Les données du formulaire mises à jour.
     * @protected
     * @override
     */
    async _updateObject(event, formData) {
        // Log les données initiales du formulaire pour le débogage.
        console.log("AKREL | _updateObject: formData initial (full):", formData);

        // Appelle la méthode _updateObject de la classe parente (ActorSheet).
        // C'est cette ligne qui prend les `formData` et les applique à l'acteur.
        await super._updateObject(event, formData);

        // Log les données de l'acteur après la mise à jour de la classe parente.
        // Cela permet de voir l'état des données APRES que Foundry ait traité les changements.
        console.log("AKREL | _updateObject: actor.system.groupMembers AFTER super.update:", this.actor.system.groupMembers);
        console.log("AKREL | _updateObject: Base Stats de l'acteur après super.update:", this.actor.system.caracs);
    }
}