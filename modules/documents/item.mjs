import { AKREL } from "../config.mjs"; 

/**
 * Classe de base personnalisée pour les items du système AKREL.
 * Gère la création, la récupération des attributs d'acteur, et la logique de jet.
 */
export class AKRELItem extends Item {

    /** @inheritdoc */
    static async create(data, options = {}) {
        if (data.img === undefined) {
            switch(data.type) {
                case "weapon":
                    data.img = "systems/akrel/assets/icons/weapon.svg";
                    break;
                case "armor":
                    data.img = "systems/akrel/assets/icons/armor.png";
                    break;
                case "loot":
                    data.img = "systems/akrel/assets/icons/loot.png";
                    break;
                case "spell":
                    data.img = "systems/akrel/assets/icons/spell.svg";
                    break;
                case "passive":
                    data.img = "systems/akrel/assets/icons/passive.svg";
                    break;
            }
        }
        return super.create(data, options);
    }

    /** @inheritdoc */
    static async createDialog(data={}, options={}) {
        if (!data.type && (options.context?.type === CONST.DOCUMENT_TYPES.ACTOR || options.context?.type === CONST.DOCUMENT_TYPES.ITEM)) {
            data.type = "weapon";
        }
        return super.createDialog(data, options);
    }

    /**
     * Récupère la valeur d'un attribut spécifique de l'acteur.
     * @param {object} actor L'acteur propriétaire de l'item.
     * @param {string} attributeKey La clé de l'attribut à récupérer (ex: 'social', 'physical').
     * @returns {number} La valeur de l'attribut ou 0 si non trouvé/non valide.
     */
    _getActorAttributeValue(actor, attributeKey) {
        switch (attributeKey) {
            case 'social':
                return actor.system.caracs.social || 0;
            case 'physical':
                return actor.system.caracs.physical || 0;
            case 'intelligence':
                return actor.system.caracs.intelligence || 0;
            case 'dexterity':
                return actor.system.caracs.dexterity || 0;
            default:
                console.warn(`AKREL | Attribut inconnu ou non géré pour le jet: ${attributeKey}`);
                return 0;
        }
    }

    /**
     * Exécute un jet d'item (attaque, compétence, etc.) ou envoie la description de l'item dans le chat.
     * @param {object} options Options supplémentaires pour le jet.
     */
    async roll(options = {}) {
        const actor = this.actor;
        if (!actor) {
            ui.notifications.warn(game.i18n.localize("AKREL.NOTIFICATIONS.NO_ACTOR_OWNER"));
            return;
        }

        console.log("AKREL | roll() called for item:", this.name, "of type:", this.type);

        // Pour les items qui ne nécessitent pas de jet (armor, loot, passive),
        // on envoie directement leur description dans le chat.
        if (['armor', 'loot', 'passive'].includes(this.type)) {
            console.log("AKREL | This is a passive/armor/loot item. Creating simple chat card.");
            const cardData = {
                itemName: this.name,
                itemImg: this.img,
                flavorText: this.system.description || "",
            };
            console.log("AKREL | cardData for simple chat card:", cardData);
            
            const chatTemplate = "systems/akrel/templates/chat/roll-chat-card.hbs";
            const content = await foundry.applications.handlebars.renderTemplate(chatTemplate, cardData);
            console.log("AKREL | Rendered content for simple chat card:", content);
            
            await ChatMessage.create({
                speaker: ChatMessage.getSpeaker({ actor: actor }),
                content: content,
                // Correction ici : Utilisation de la nouvelle constante
                style: CONST.CHAT_MESSAGE_STYLES.OTHER, 
            });
            console.log("AKREL | Chat message for simple chat card created.");
            return;
        }

        // Logique pour les items nécessitant un jet (weapon, spell)
        console.log("AKREL | This is a weapon/spell item. Proceeding with roll dialog.");
        let attributeName = "";
        let baseAttributeValue = 0;
        let dialogType = "";
        let showDamageFields = false;
        let actionTypeLabel = ""; 
        let baseDiceFormula = this.system.dice || "";

        const itemAttackAttribute = this.system.attackAttribute;
        if (!itemAttackAttribute) {
            ui.notifications.error(game.i18n.format("AKREL.NOTIFICATIONS.NO_ATTACK_ATTRIBUTE", { itemName: this.name }));
            this.sheet.render(true);
            return;
        }

        baseAttributeValue = this._getActorAttributeValue(actor, itemAttackAttribute);
        attributeName = game.i18n.localize(`AKREL.ATTRIBUTES.${itemAttackAttribute.toUpperCase()}`);

        switch (this.type) {
            case 'spell':
                const spellType = this.system.spellType;
                dialogType = game.i18n.localize(`AKREL.ITEM_TYPES.SPELL_${spellType.toUpperCase()}`); 
                actionTypeLabel = game.i18n.localize(`AKREL.CHAT.SKILL_USE_${spellType.toUpperCase()}`);
                
                switch (spellType) { 
                    case 'offensive':
                        showDamageFields = true;
                        break;
                    case 'healing':
                        showDamageFields = true;
                        break;
                    case 'utility':
                        showDamageFields = false;
                        baseDiceFormula = "";
                        break;
                    default: 
                        dialogType = game.i18n.localize("AKREL.ITEM_TYPES.SPELL_GENERIC");
                        actionTypeLabel = game.i18n.localize("AKREL.CHAT.SKILL_USE_GENERIC");
                        showDamageFields = false;
                        baseDiceFormula = "";
                }
                break;

            case 'weapon':
                dialogType = game.i18n.localize("AKREL.ITEM_TYPES.WEAPON");
                actionTypeLabel = game.i18n.localize("AKREL.CHAT.WEAPON_ATTACK");
                showDamageFields = true;
                break;

            default:
                this.sheet.render(true);
                return;
        }

        await this._showItemRollDialog(
            actor,
            this,
            attributeName,
            baseAttributeValue,
            dialogType,
            showDamageFields,
            actionTypeLabel,
            baseDiceFormula,
            options
        );
    }

    /**
     * Affiche le dialogue de jet et gère l'envoi des résultats au chat.
     */
    async _showItemRollDialog(actor, item, attributeName, baseAttributeValue, dialogType, showDamageFields, actionTypeLabel, baseDiceFormula, options = {}) {
        const template = "systems/akrel/templates/dialogs/item-roll-dialog.hbs";

        const dialogData = {
            itemName: item.name,
            dialogType: dialogType,
            attributeName: attributeName,
            baseAttributeValue: baseAttributeValue,
            inCombat: actor.inCombat || false,
            showDamageFields: showDamageFields,
        };

        const html = await foundry.applications.handlebars.renderTemplate(template, dialogData);

        const rollButtonCallback = async (dialogHtml) => {
            const form = dialogHtml[0].querySelector("form");
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            const modifier = parseInt(data.modifier || 0);
            const inCombatBonus = data.inCombat ? (AKREL.combatBonus || 20) : 0; 

            const totalTarget = baseAttributeValue + modifier + inCombatBonus;

            const rollFormula = "1d100";
            const roll = new Roll(rollFormula, actor.getRollData());
            await roll.evaluate();

            const rollResult = roll.total;
            let isSuccess = rollResult <= totalTarget;
            let successText = isSuccess ? game.i18n.localize("AKREL.ROLL.SUCCESS") : game.i18n.localize("AKREL.ROLL.FAILURE");

            let isCriticalSuccess = false;
            let isCriticalFailure = false;
            if (rollResult >= 1 && rollResult <= 10) {
                isCriticalSuccess = true;
                successText = game.i18n.localize("AKREL.ROLL.CRITICAL_SUCCESS");
                isSuccess = true;
            } else if (rollResult >= 91 && rollResult <= 100) {
                isCriticalFailure = true;
                successText = game.i18n.localize("AKREL.ROLL.CRITICAL_FAILURE");
                isSuccess = false;
            }

            let effectResult = "";
            let rollsToDisplay = [roll];

            if (isSuccess || item.system.spellType === "utility") { 
                const formulaParts = [];

                if (baseDiceFormula) {
                    formulaParts.push(baseDiceFormula);
                }

                if (showDamageFields) {
                    const damageDiceModifier = data.damageDiceModifier || "";

                    if (damageDiceModifier) {
                        formulaParts.push(damageDiceModifier);
                    }
                }
                
                const finalEffectFormula = formulaParts.join(' + ').trim();

                if (finalEffectFormula) {
                    try {
                        const effectRoll = new Roll(finalEffectFormula, actor.getRollData());
                        await effectRoll.evaluate();
                        effectResult = await effectRoll.render();
                        rollsToDisplay.push(effectRoll);
                    } catch (e) {
                        ui.notifications.error(game.i18n.localize("AKREL.NOTIFICATIONS.INVALID_DICE_FORMULA"));
                        effectResult = game.i18n.localize("AKREL.CHAT.EFFECT_ERROR");
                    }
                }
            } else if (!isSuccess) {
                effectResult = game.i18n.localize("AKREL.CHAT.NO_EFFECT_ON_FAILURE");
            }
            
            // Nouvelle logique pour le titre d'attribut pour la carte de chat
            const vowels = ['A', 'E', 'I', 'O', 'U', 'Y'];
            const firstLetter = attributeName.charAt(0).toUpperCase();
            const attackAttributeTitle = vowels.includes(firstLetter) ? game.i18n.localize("AKREL.CHAT.L_APOSTROPHE") + attributeName.toLowerCase() : game.i18n.localize("AKREL.CHAT.LE") + ' ' + attributeName.toLowerCase();
            
            const cardData = {
                itemName: item.name,
                itemImg: item.img, 
                itemDescription: item.system.description,
                attackAttributeTitle: attackAttributeTitle,
                attackAttribute: attributeName,
                baseAttributeValue: baseAttributeValue,
                inFightBonus: inCombatBonus > 0 ? inCombatBonus : null,
                modifier: modifier !== 0 ? modifier : null,
                totalTarget: totalTarget,
                rollResult: rollResult,
                isSuccess: isSuccess,
                successText: successText,
                effectResult: effectResult,
                flavorText: item.system.description || "",
                spellType: item.system.spellType,
                isCriticalSuccess: isCriticalSuccess,
                isCriticalFailure: isCriticalFailure
            };

            const chatTemplate = "systems/akrel/templates/chat/roll-chat-card.hbs";
            const content = await foundry.applications.handlebars.renderTemplate(chatTemplate, cardData); 

            await ChatMessage.create({
                speaker: ChatMessage.getSpeaker({ actor: actor }),
                content: content,
                // Correction ici : Retrait de 'type' car 'rolls' est présent.
                rolls: rollsToDisplay,
            });
        };

        const dialogConfig = {
            title: game.i18n.format("AKREL.DIALOG.ROLL_TITLE", { itemName: item.name, dialogType: dialogType }), 
            content: html,
            buttons: { 
                roll: {
                    label: game.i18n.localize("AKREL.DIALOG.ROLL_BUTTON"),
                    icon: '<i class="fas fa-dice"></i>',
                    callback: rollButtonCallback
                }
            },
            default: "roll"
        };

        try {
            const dialog = new Dialog(dialogConfig);
            dialog.render(true);
        } catch (error) {
            console.error("AKREL | ERREUR LORS DE LA CRÉATION DU DIALOGUE :", error);
            ui.notifications.error(game.i18n.localize("AKREL.NOTIFICATIONS.DIALOG_ERROR"));
        }
    }
}
