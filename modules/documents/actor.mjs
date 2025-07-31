import { AKREL } from "../config.mjs";

/**
 * Étend le document Actor de base pour gérer les comportements au niveau du document.
 * La logique de données (structure et données dérivées) est gérée par les DataModels.
 * @extends {Actor}
 */
export class AKRELActor extends Actor {
    /**
     * @override
     * Définit les images par défaut pour les nouveaux acteurs en fonction de leur type.
     * Il est recommandé de définir ces chemins dans votre fichier `config.js` pour une meilleure gestion.
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
     * Lance un jet pour une statistique donnée.
     * Ouvre un dialogue et affiche le résultat dans le chat.
     * @param {string} statKey La clé de la statistique (ex: 'social').
     * @param {number} baseStatValue La valeur de base de la statistique.
     */
    async rollStat(statKey, baseStatValue) {
        const statName = game.i18n.localize(`AKREL.ATTRIBUTES.${statKey.toUpperCase()}`);
        const template = "systems/akrel/templates/dialogs/stat-roll-dialog.hbs";

        // Déterminez si l'option de combat doit être affichée
        const showCombatOption = statKey !== 'initiative';

        // Déterminez le modificateur de combat pour le dialogue (pour un affichage dynamique si nécessaire)
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
            // La logique de combat s'applique si la stat n'est pas l'initiative ET que la case est cochée
            if (showCombatOption && data.inCombat) {
                if (statKey === 'vigilance') {
                    inCombatModifier = -20;
                } else {
                    inCombatModifier = AKREL.combatBonus || 20;
                }
            }
            
            const totalTarget = baseStatValue + modifier + inCombatModifier;

            let rollFormula;
            let roll;
            let rollResult;
            let cardData;
            
            // Logique de grammaire pour le titre
            const vowels = ['A', 'E', 'I', 'O', 'U', 'Y'];
            const firstLetter = statName.charAt(0).toUpperCase();
            const rollTitlePrefix = vowels.includes(firstLetter) ? game.i18n.localize("AKREL.CHAT.TEST_D_APOSTROPHE") : game.i18n.localize("AKREL.CHAT.TEST_DE");
            const rollTitle = `${rollTitlePrefix} ${statName.toLowerCase()}`;

            // Logique spécifique pour le jet d'initiative (1d20, pas de réussite/échec)
            if (statKey === 'initiative') {
                rollFormula = "1d20";
                roll = new Roll(rollFormula, this.getRollData());
                await roll.evaluate({ async: true });
                rollResult = roll.total;

                // Création des données pour la carte de chat, sans les variables de succès/échec
                cardData = {
                    actorName: this.name,
                    actorImg: this.img,
                    rollTitle: rollTitle,
                    rollResult: rollResult,
                    // Les variables suivantes sont omises pour que le template Handlebars ne les affiche pas
                    baseStatValue: baseStatValue,
                    totalTarget: baseStatValue,
                };

            } else { // Logique pour les autres jets de stats (1d100 avec succès/échec)
                rollFormula = "1d100";
                roll = new Roll(rollFormula, this.getRollData());
                await roll.evaluate({ async: true });
                rollResult = roll.total;

                let isSuccess = rollResult <= totalTarget;
                let successText = isSuccess ? game.i18n.localize("AKREL.ROLL.SUCCESS") : game.i18n.localize("AKREL.ROLL.FAILURE");
                
                let isCriticalSuccess = false;
                let isCriticalFailure = false;
                
                // Les critiques ne s'appliquent pas aux jets d'initiative
                if (rollResult >= 1 && rollResult <= 10) {
                    isCriticalSuccess = true;
                    successText = game.i18n.localize("AKREL.ROLL.CRITICAL_SUCCESS");
                    isSuccess = true;
                } else if (rollResult >= 91 && rollResult <= 100) {
                    isCriticalFailure = true;
                    successText = game.i18n.localize("AKREL.ROLL.CRITICAL_FAILURE");
                    isSuccess = false;
                }
                
                cardData = {
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
            }
            
            const chatTemplate = "systems/akrel/templates/chat/stat-roll-chat-card.hbs";
            const content = await foundry.applications.handlebars.renderTemplate(chatTemplate, cardData); 

            await ChatMessage.create({
                speaker: ChatMessage.getSpeaker({ actor: this }),
                content: content,
                type: CONST.CHAT_MESSAGE_TYPES.ROLL,
                rolls: [roll],
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
