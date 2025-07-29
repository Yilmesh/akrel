// systems/akrel/module/sheets/akrelItemSheet.js

import { AKREL } from "../config.js"; 
import akrelActorSheet from "./akrelActorSheet.js"; // Ce n'est pas directement utilisé dans cette feuille, mais peut-être ailleurs.

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
        // Ceci permet à Foundry de chercher weapon-sheet.hbs, spell-sheet.hbs, etc.
        return `${path}${this.item.type}-sheet.hbs`;
    }

    /** @inheritdoc */
    getData() {
        const data = super.getData();
        data.config = CONFIG.AKREL; 
        data.system = data.item.system;

        // Assurez-vous que les types d'attributs d'attaque sont disponibles pour les listes déroulantes des templates
        // C'est important pour le selectOptions de votre spell-sheet.hbs
        data.config.attackTypes = {
            "PHYSICAL": "AKREL.ATTRIBUTES.PHYSICAL",
            "AGILITY": "AKREL.ATTRIBUTES.AGILITY",
            "INTELLECT": "AKREL.ATTRIBUTES.INTELLECT",
            "SPIRIT": "AKREL.ATTRIBUTES.SPIRIT",
            "PRESENCE": "AKREL.ATTRIBUTES.PRESENCE"
        };
        
        return data;
    }

    /** @inheritdoc */
    activateListeners(html) {
        super.activateListeners(html);

        if ( !this.isEditable ) return;

        // Gère les clics sur les boutons de contrôle d'item (comme le jet d'arme/sort)
        html.find(".item-control[data-action='rollWeaponAttack']").click(this._onItemControlClick.bind(this));
        html.find(".item-control[data-action='rollSpell']").click(this._onItemControlClick.bind(this));
        
        // Gère le bouton "Jet d'Effet (Simple)" sur la feuille de sort
        html.find(".roll-damage").click(this._onRollDamageFromSheet.bind(this));

        // Si vous avez d'autres actions spécifiques aux feuilles d'item, ajoutez-les ici
        // Ex: html.find(".some-other-button").click(this._onSomeOtherAction.bind(this));
    }

    /**
     * Gère le clic sur un élément de contrôle d'item sur la feuille d'item.
     * Pour les actions de jet (arme/sort), elle délègue à la feuille d'acteur si l'item est possédé.
     * @param {Event} event L'événement de clic.
     * @private
     */
    async _onItemControlClick(event) {
        event.preventDefault();
        const button = $(event.currentTarget);
        const action = button.data("action");
        const item = this.item; // L'item est directement accessible via this.item sur sa propre feuille

        console.log(`AKREL | Action '${action}' déclenchée depuis la feuille d'item : ${item.name} (${item.type})`);

        switch (action) {
            case "rollWeaponAttack":
                if (item.type === "weapon") {
                    // Pour qu'un jet d'arme ait du sens avec les stats de l'acteur,
                    // l'arme doit être possédée par un acteur.
                    if (item.parent instanceof Actor) {
                        // Accède à la feuille de l'acteur parent et appelle sa méthode de jet
                        // C'est la solution la plus propre car _showItemRollDialog réside sur la feuille d'acteur.
                        await item.parent.sheet._showItemRollDialog(item, "weaponAttack");
                    } else {
                        ui.notifications.warn(game.i18n.localize("AKREL.WARNING.NO_ACTOR_FOR_WEAPON_ROLL"));
                        console.warn(`AKREL | Impossible de lancer un jet d'arme sans un acteur possédant cette arme.`);
                    }
                }
                break;

            case "rollSpell":
                if (item.type === "spell") {
                    // Similaire pour les sorts : ils nécessitent un acteur pour les stats de mana et de jet.
                    if (item.parent instanceof Actor) {
                        await item.parent.sheet._showItemRollDialog(item, "spellCast");
                    } else {
                        ui.notifications.warn(game.i18n.localize("AKREL.WARNING.NO_ACTOR_FOR_SPELL_ROLL"));
                        console.warn(`AKREL | Impossible de lancer un sort sans un acteur possédant ce sort.`);
                    }
                }
                break;

            case "chat":
                // Si l'item a une méthode toMessage, utilisez-la. Sinon, loggez un avertissement.
                if (typeof item.toMessage === 'function') {
                    item.toMessage();
                } else {
                    console.warn(`AKREL | L'item '${item.name}' de type '${item.type}' n'a pas de méthode 'toMessage()'. Impossible de l'envoyer au chat par cette action.`);
                    ui.notifications.warn(game.i18n.localize("AKREL.ERROR.ITEM_NO_CHAT_FUNCTION"));
                }
                break;

            default:
                console.warn(`AKREL | Action non reconnue sur la feuille d'item : ${action}`);
        }
    }

    /**
     * Gère le jet de la formule d'effet (dés) directement depuis la feuille de sort.
     * Utile si on veut un jet rapide sans passer par le dialogue complet de l'acteur.
     * @param {Event} event
     * @private
     */
    async _onRollDamageFromSheet(event) {
        event.preventDefault();
        const item = this.item;
        const rollFormula = item.system.dice; // Utilise le champ 'dice' pour la formule d'effet

        if (!rollFormula) {
            ui.notifications.warn(game.i18n.localize("AKREL.WARNING.NO_DICE_FORMULA")); // Clé de localisation mise à jour
            return;
        }

        try {
            const roll = new Roll(rollFormula);
            await roll.evaluate({ async: true });

            // On assume que c'est un jet de "dégâts" ou "effet"
            // Si vous avez besoin de différencier "dégâts" et "soins", il faudrait ajouter un champ `effectType` au SpellDataModel
            const rollTypeLabel = game.i18n.localize("AKREL.ROLL.EFFECT"); // Ou AKREL.ROLL.DAMAGES si c'est toujours des dégâts

            const chatContent = await renderTemplate("systems/akrel/templates/chat/simple-damage-roll-card.hbs", {
                item: item, // Passer l'item pour l'image et le nom dans le template
                itemName: item.name,
                rollResult: roll.total,
                rollFormula: rollFormula,
                rollType: rollTypeLabel
            });

            ChatMessage.create({
                user: game.user._id,
                speaker: ChatMessage.getSpeaker({ actor: item.actor }), // Utilise l'acteur parent si l'item en a un
                content: chatContent,
                rolls: [roll],
                sound: CONFIG.sounds.dice
            });

            console.log(`AKREL | Jet de formule d'effet simple depuis feuille d'item (${item.name}) : ${roll.total}`);
        } catch (e) {
            console.error("AKREL | Erreur lors du jet de formule d'effet depuis la feuille de sort:", e);
            ui.notifications.error(game.i18n.format("AKREL.ERROR.INVALID_ROLL_FORMULA", { formula: rollFormula }));
        }
    }
}