import { AKREL } from "../config.mjs";

/**
 * Extends the base Actor document to handle document-level behaviors.
 * Data logic (structure and derived data) is handled by DataModels.
 * @extends {Actor}
 */
export class AKRELActor extends Actor {
    /**
     * @override
     * Sets default images for new actors based on their type.
     * It is recommended to define these paths in your `config.js` file for better management.
     */
    static async create(data, options = {}) {
        await super.create(data, options);
    }

    /** @override */
    prepareData() {
        // Prepare data for the actor. Calling the super version of this executes
        // the following, in order: data reset (to clear active effects),
        // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
        // prepareDerivedData().
        super.prepareData();
    }

    prepareDerivedData() {
        this._prepareAkrelActorData();
    }

    _prepareAkrelActorData() {
        const systemData = this.system;

        switch (this.type) {
            case 'character':
                this._prepareCharacterData(systemData);
                break;
            case 'npc': 
                this._prepareNpcData(systemData);
                break;
        }
    }

    /**
     * @param {object} characterData 
     * @private
     */
    _prepareCharacterData(characterData) {
        if (this.type !== 'character') return;
        // console.log(`AKREL | Préparation des données dérivées pour le personnage ${this.name}`);
    }
    
    /**
     * @param {object} npcData  
     * @private
     */
    _prepareNpcData(npcData) {
        if (this.type !== 'npc') return;
        // console.log(`AKREL | Préparation des données dérivées pour le PNJ ${this.name}`);
    }

    /**
     * Rolls a stat for the given actor.
     * Opens a dialog and displays the result in the chat.
     * @param {string} statKey The stat key (e.g., 'social').
     * @param {number} baseStatValue The base value of the stat.
     */
    async rollStat(statKey, baseStatValue) {
        // Handle the special case for initiative roll first.
        if (statKey === 'initiative') {
            console.log(`AKREL | Début du jet d'initiative pour ${this.name} avec la valeur de base : ${baseStatValue}`);

            // Formula for the initiative roll: 1d20 + the stat value.
            const formula = `1d20 + ${baseStatValue}`;
            
            // Create and evaluate the roll manually
            const roll = new Roll(formula, this.getRollData());
            await roll.evaluate();

            console.log(`AKREL | Résultat du jet d'initiative : ${roll.total}`);

            // Find or create a combatant for the actor
            let combatant = game.combat?.getCombatantByActor(this.id);
            if (!combatant) {
                // If there's no combatant, we need to add one to the combat tracker
                if (game.combat) {
                    await game.combat.createCombatant({ actorId: this.id, initiative: roll.total });
                } else {
                    // If no combat is active, just log the result and do nothing else
                    ui.notifications.warn(game.i18n.localize("AKREL.NOTIFICATIONS.NO_ACTIVE_COMBAT"));
                }
            } else {
                // If a combatant exists, update its initiative value
                await combatant.update({ initiative: roll.total });
            }
            
            // Render the roll to the chat for the user to see the result.
            // Note: You should add "AKREL.CHAT.INITIATIVE_ROLL" to your i18n JSON file.
            const chatData = {
                speaker: ChatMessage.getSpeaker({ actor: this }),
                roll: roll,
                content: game.i18n.format("AKREL.CHAT.INITIATIVE_ROLL", {
                    actorName: this.name,
                    rollResult: roll.total,
                    formula: roll.formula
                }),
                rolls: [roll] // Le style est maintenant déduit de la présence de la propriété rolls
            };
            await ChatMessage.create(chatData);

            return;
        }

        // The rest of the function handles the standard stat rolls (1d100)
        const statName = game.i18n.localize(`AKREL.ATTRIBUTES.${statKey.toUpperCase()}`);
        const template = "systems/akrel/templates/dialogs/stat-roll-dialog.hbs";

        // Determine if the combat option should be displayed.
        const showCombatOption = statKey !== 'initiative';

        // Determine the combat modifier for the dialog (for dynamic display if necessary).
        let inCombatModifierValue = AKREL.combatBonus || 20;
        if (statKey === 'vigilance') {
            inCombatModifierValue = -20;
        }

        const dialogData = {
            statName: statName,
            baseStatValue: baseStatValue,
            inCombat: this.inCombat || false,
            combatModifierValue: inCombatModifierValue,
            showCombatOption: showCombatOption,
        };

        const html = await foundry.applications.handlebars.renderTemplate(template, dialogData);

        const rollButtonCallback = async (dialogHtml) => {
            const form = dialogHtml[0].querySelector("form");
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            const modifier = parseInt(data.modifier || 0);
            
            let inCombatModifier = 0;
            // The combat logic applies if the stat is not initiative AND the box is checked.
            if (showCombatOption && data.inCombat) {
                if (statKey === 'vigilance') {
                    inCombatModifier = -20;
                } else {
                    inCombatModifier = AKREL.combatBonus || 20;
                }
            }
            
            const totalTarget = baseStatValue + modifier + inCombatModifier;
            const rollFormula = "1d100";
            const roll = new Roll(rollFormula, this.getRollData());
            await roll.evaluate({ async: true });
            const rollResult = roll.total;

            let isSuccess = rollResult <= totalTarget;
            let successText = isSuccess ? game.i18n.localize("AKREL.ROLL.SUCCESS") : game.i18n.localize("AKREL.ROLL.FAILURE");
            
            let isCriticalSuccess = false;
            let isCriticalFailure = false;
            
            // Critical hits do not apply to initiative rolls.
            if (rollResult >= 1 && rollResult <= 10) {
                isCriticalSuccess = true;
                successText = game.i18n.localize("AKREL.ROLL.CRITICAL_SUCCESS");
                isSuccess = true;
            } else if (rollResult >= 91 && rollResult <= 100) {
                isCriticalFailure = true;
                successText = game.i18n.localize("AKREL.ROLL.CRITICAL_FAILURE");
                isSuccess = false;
            }
            
            // Grammar logic for the title.
            const vowels = ['A', 'E', 'I', 'O', 'U', 'Y'];
            const firstLetter = statName.charAt(0).toUpperCase();
            const rollTitlePrefix = vowels.includes(firstLetter) ? game.i18n.localize("AKREL.CHAT.TEST_D_APOSTROPHE") : game.i18n.localize("AKREL.CHAT.TEST_DE");
            const rollTitle = `${rollTitlePrefix} ${statName.toLowerCase()}`;
            
            const cardData = {
                actorName: this.name,
                actorImg: this.img,
                rollTitle: rollTitle,
                baseStatValue: baseStatValue,
                modifier: modifier !== 0 ? modifier : null,
                inCombatBonus: inCombatModifier > 0 ? inCombatModifier : null,
                inCombatMalus: inCombatModifier < 0 ? inCombatModifier : null,
                totalTarget: totalTarget,
                rollResult: rollResult,
                isSuccess: isSuccess,
                successText: successText,
                isCriticalSuccess: isCriticalSuccess,
                isCriticalFailure: isCriticalFailure
            };
            
            const chatTemplate = "systems/akrel/templates/chat/stat-roll-chat-card.hbs";
            const content = await foundry.applications.handlebars.renderTemplate(chatTemplate, cardData); 

            await ChatMessage.create({
                speaker: ChatMessage.getSpeaker({ actor: this }),
                content: content,
                rolls: [roll], // Le style est maintenant déduit de la présence de la propriété rolls
            });
        };

        const dialogConfig = {
            title: game.i18n.format("AKREL.DIALOG.PERFORM_STAT_ROLL", { statName: statName }), 
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
            console.error("AKREL | ERREUR LORS DE LA CRÉATION DU DIALOGUE DE STAT :", error);
            ui.notifications.error(game.i18n.localize("AKREL.NOTIFICATIONS.DIALOG_ERROR"));
        }
    }
}
