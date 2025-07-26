/**
 * @extends {ActorSheet}
 */
export default class akrelActorSheet extends ActorSheet {

    /**
     * Options par défaut de la feuille d'acteur.
     * @returns {Object}
     */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["akrel", "sheet", "actor"],
            width: 800,
            height: 700,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "identity" }],
            scrollY: [".attributes"], // Permet le défilement dans la section .attributes
            dragDrop: [{dragSelector: ".draggable", dropSelector: null}], // Permet le glisser-déposer pour les éléments avec la classe .draggable
        });
    }

    /**
     * Sélection dynamique du template de la feuille en fonction du type d'acteur.
     * @returns {string} Le chemin vers le template Handlebars.
     */
    get template() {
        const path = "systems/akrel/templates/sheets/actors/";
        return `${path}${this.actor.type}-sheet.hbs`;
    }

    /**
     * Prépare les données pour le template de la feuille.
     * Cette méthode est appelée chaque fois que la feuille est rendue ou mise à jour.
     * @returns {Object} Les données du contexte pour le template Handlebars.
     */
    getData() {
        const context = super.getData();
        
        // Assigne l'acteur et ses données système au contexte du template
        context.actor = this.actor;
        context.system = this.actor.system;
        
        // --- GESTION DES MEMBRES DU GROUPE ---
        // Avec groupMembers défini comme un ArrayField dans CharacterDataModel.js,
        // il est garanti d'être un tableau (vide ou non), donc aucune initialisation complexe n'est requise ici.
        // Si votre modèle de données n'est pas encore mis à jour, Foundry gérera tout de même la création
        // d'un tableau vide si le champ n'existe pas, mais la définition dans le modèle est la meilleure pratique.
        
        // Prépare et classe les items de l'acteur par type (sorts, passifs, armes, armures, butins)
        this._prepareCharacterItems(context);

        // Ajoute les données de configuration du système (définies dans akrel.js)
        context.config = CONFIG.AKREL;

        // Logs pour le débogage (à retirer en production)
        console.log("AKREL | Contexte final pour le template :", context);

        return context;
    }

    /**
     * Initialise les écouteurs d'événements DOM pour les interactions de la feuille.
     * @param {jQuery} html Le wrapper jQuery pour le contenu HTML de la feuille.
     */
    activateListeners(html) {
        super.activateListeners(html);

        // Retourne si la feuille n'est pas éditable (pour les joueurs n'ayant pas la permission)
        if ( !this.isEditable ) return;
        
        // --- ÉCOUTEURS SPÉCIFIQUES AUX MEMBRES DU GROUPE ---

        /**
         * Écouteur pour le bouton "Ajouter un membre au groupe".
         * Ajoute un nouvel objet membre au tableau groupMembers de l'acteur.
         */
        html.find(".add-group-member").click(async ev => {
            const currentMembers = this.actor.system.groupMembers; // Ceci est déjà un tableau grâce au modèle de données
            const newMember = { name: "", opinion: "" }; // Structure du nouveau membre
            
            // Met à jour l'acteur en ajoutant le nouveau membre au tableau
            await this.actor.update({
                "system.groupMembers": [...currentMembers, newMember] // Crée un nouveau tableau avec les anciens membres + le nouveau
            });
            // Foundry gère le re-rendu automatique de la feuille après l'update, pas besoin de this.render(true)
        });

        /**
         * Écouteur pour le bouton "Supprimer" un membre du groupe.
         * Supprime un membre spécifique du tableau groupMembers de l'acteur.
         */
        html.find(".group-member-delete").click(async ev => {
            const li = $(ev.currentTarget).parents(".item-row"); // Remonte au conteneur de la ligne du membre
            const memberIndex = parseInt(li.data("member-index"), 10); // Récupère l'index du membre depuis l'attribut data-member-index

            // Vérifie si l'index est valide
            if (isNaN(memberIndex)) {
                ui.notifications.error("AKREL | Erreur : Index de membre invalide pour la suppression.");
                return;
            }

            try {
                // Demande une confirmation avant de supprimer
                const confirmDelete = await Dialog.confirm({
                    title: game.i18n.localize("AKREL.DIALOG.DELETE_CONFIRM_TITLE"),
                    content: game.i18n.format("AKREL.DIALOG.DELETE_MEMBER_CONFIRM_CONTENT") 
                });

                if (!confirmDelete) {
                    console.log("AKREL | Suppression de membre annulée par l'utilisateur.");
                    return;
                }

                const currentMembers = this.actor.system.groupMembers;
                // Crée un nouveau tableau en filtrant l'élément à l'index spécifié
                const updatedMembers = currentMembers.filter((_, i) => i !== memberIndex);

                // Met à jour l'acteur avec le tableau filtré
                await this.actor.update({ "system.groupMembers": updatedMembers });
                ui.notifications.info(game.i18n.localize("AKREL.NOTIFICATIONS.MEMBER_DELETED"));
                // Foundry gère le re-rendu automatique de la feuille après l'update
            } catch (error) {
                console.error("AKREL | Erreur lors de la suppression du membre :", error);
                ui.notifications.error(game.i18n.format("AKREL.NOTIFICATIONS.MEMBER_DELETE_ERROR", { error: error.message }));
            }
        });
        
        // --- ÉCOUTEURS GÉNÉRIQUES POUR LES ITEMS ---

        /**
         * Rend les lignes d'items glissables pour le glisser-déposer.
         */
        html.find(".item-row").each((i, el) => {
            if (el.dataset.itemId) { // S'assure que c'est bien une ligne d'item avec un ID
                el.setAttribute("draggable", true);
                el.addEventListener("dragstart", this._onDragStart.bind(this), false);
            }
        });

        /**
         * Désactive l'ouverture de la fiche d'un item au clic sur son nom.
         * Si vous souhaitez réactiver cette fonctionnalité, décommentez le code à l'intérieur de ce bloc.
         */
        html.find(".item-name-cell").click(ev => {
            const li = $(ev.currentTarget).parents(".item-row");
            const itemId = li.data("item-id"); 
            
            // Console.log de débogage (peut être laissé ou retiré)
            // console.log(`AKREL | Clic sur le nom. ID trouvé : ${itemId}.`);

            // --- Logique d'ouverture de fiche d'item commentée car non désirée ---
            /*
            const item = this.actor.items.get(itemId);
            if (item) {
                item.sheet.render(true);
            } else {
                console.error("AKREL | Erreur : Impossible de trouver l'item avec l'ID pour ouvrir la fiche :", itemId);
                ui.notifications.error("AKREL | Impossible d'ouvrir la fiche : Item non trouvé.");
            }
            */
            // --- Fin de la logique commentée ---
        });

        /**
         * Écouteur générique pour les boutons d'action d'item (ex: chat, utiliser, équiper).
         */
        html.find(".item-control.item-chat").click(ev => {
            const li = $(ev.currentTarget).parents(".item-row");
            const item = this.actor.items.get(li.data("item-id"));
            const itemType = $(ev.currentTarget).data("item-type"); // Récupère le type d'item de l'attribut data-item-type

            if (item) {
                // Remplacez ou complétez cette logique par vos actions spécifiques d'item
                console.log(`AKREL | Action 'chat'/'use'/'equip' pour l'item : ${item.name} (Type: ${itemType})`);
                // Exemple : item.toMessage(); // Pour envoyer l'item au chat
            }
        });

        /**
         * Écouteur générique pour les boutons de suppression d'item avec confirmation.
         */
        html.find(".item-control.item-delete").click(async ev => {
            const li = $(ev.currentTarget).parents(".item-row");
            const itemId = li.data("item-id");
            const item = this.actor.items.get(itemId); // Récupère l'objet Item complet

            console.log("AKREL | Tentative de suppression de l'item avec ID :", itemId, "Type:", item?.type);

            if (!itemId) {
                console.error("AKREL | Erreur : itemId est manquant ou non valide pour la suppression.");
                ui.notifications.error("AKREL | Impossible de supprimer : ID d'item manquant.");
                return;
            }

            try {
                // Demande de confirmation avant suppression
                const confirmDelete = await Dialog.confirm({
                    title: game.i18n.localize("AKREL.DIALOG.DELETE_CONFIRM_TITLE"),
                    content: game.i18n.format("AKREL.DIALOG.DELETE_CONFIRM_CONTENT", { itemName: item?.name || "cet élément" })
                });

                if (!confirmDelete) {
                    console.log("AKREL | Suppression annulée par l'utilisateur.");
                    return;
                }

                // Supprime l'item embarqué de l'acteur
                await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
                console.log(`AKREL | Item avec ID ${itemId} supprimé avec succès.`);
                ui.notifications.info(game.i18n.format("AKREL.NOTIFICATIONS.ITEM_DELETED", { itemName: item?.name || "L'élément" }));

            } catch (error) {
                console.error("AKREL | Erreur lors de la suppression de l'item :", error);
                ui.notifications.error(game.i18n.format("AKREL.NOTIFICATIONS.ITEM_DELETE_ERROR", { error: error.message }));
            }
        });

        // --- EXEMPLE POUR DES BOUTONS DE DÉPLACEMENT D'ITEM (commenté car non présent dans votre HBS) ---
        /*
        html.find(".item-control.item-move-up").click(async ev => {
            const li = $(ev.currentTarget).parents(".item-row");
            const itemId = li.data("item-id");
            const item = this.actor.items.get(itemId);
            if (item) await item.sortRelative({direction: -1});
        });

        html.find(".item-control.item-move-down").click(async ev => {
            const li = $(ev.currentTarget).parents(".item-row");
            const itemId = li.data("item-id");
            const item = this.actor.items.get(itemId);
            if (item) await item.sortRelative({direction: 1});
        });
        */
    }

    /* --- Méthodes auxiliaires --- */

    /**
     * Prépare et classe les items de l'acteur par type pour l'affichage dans le template.
     * @param {Object} sheetData Les données de la feuille d'acteur.
     * @private
     */
    _prepareCharacterItems(sheetData) {
        const actorData = sheetData.actor;
        // sheetData.items contient déjà tous les items de l'acteur, fournis par super.getData()
        const items = sheetData.items; 

        // Initialisation des tableaux pour chaque type d'item
        const spells = [];
        const passives = [];
        const weapons = [];
        const armors = [];
        const loots = [];

        // Itère sur tous les items et les classe selon leur type
        for (let i of items) {
            if (i.type === 'spell') {
                spells.push(i);
            } else if (i.type === 'passive') {
                passives.push(i);
            } else if (i.type === 'weapon') {
                weapons.push(i);
            } else if (i.type === 'armor') {
                armors.push(i);
            } else if (i.type === 'loot') {
                loots.push(i);
            }        
        }
        
        // Assigner les listes d'items filtrées à l'objet acteur, avec tri par la propriété 'sort'
        actorData.spells = spells.sort((a, b) => (a.sort || 0) - (b.sort || 0));
        actorData.passives = passives.sort((a, b) => (a.sort || 0) - (b.sort || 0));
        actorData.weapons = weapons.sort((a, b) => (a.sort || 0) - (b.sort || 0));
        actorData.armors = armors.sort((a, b) => (a.sort || 0) - (b.sort || 0));
        actorData.loots = loots.sort((a, b) => (a.sort || 0) - (b.sort || 0));

        // Logs de vérification (à retirer en production)
        console.log("AKREL | _prepareCharacterItems: Nombre de sorts :", actorData.spells.length);
        console.log("AKREL | _prepareCharacterItems: Nombre de passifs :", actorData.passives.length);
        console.log("AKREL | _prepareCharacterItems: Nombre d'armes :", actorData.weapons.length);
        console.log("AKREL | _prepareCharacterItems: Nombre d'armures :", actorData.armors.length);
        console.log("AKREL | _prepareCharacterItems: Nombre de butins :", actorData.loots.length);
    }

    /**
     * Prépare les données pour l'opération de glisser-déposer.
     * @param {Event} event L'événement dragstart.
     * @private
     */
    _onDragStart(event) {
        const li = event.currentTarget;

        // Ne rien faire si l'élément glissé est un lien de contenu (ex: un lien vers un journal)
        if ( event.target.classList.contains("content-link") ) return;

        // Récupère l'ID et l'objet item pour la donnée de glisser-déposer
        const itemId = li.dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (!item) return;

        // Définit les données transférées pour Foundry VTT
        const dragData = {
            type: "Item",
            uuid: item.uuid // Utilise l'UUID global pour une meilleure compatibilité Foundry
        };

        // Définit les données JSON dans l'événement de glisser-déposer
        event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
    }
}