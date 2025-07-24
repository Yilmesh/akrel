// systems/akrel/modules/documents/actor.js

/**
 * Extend the base Actor document to support attributes and groups with a custom template creation dialog.
 * @extends {Actor}
 */
export class AKRELActor extends Actor {
    /**
     * Create a new entity using provided input data
     * @override
     */
    static async create(data, options = {}) {
        // Replace default image
        if (data.img === undefined){
            // A CHANGER L'IMAGE
            // Utiliser une logique similaire à celle de prepareDerivedData pour les images par défaut si besoin
            switch (data.type) {
                case "character":
                    data.img = "systems/akrel/assets/icons/loot.png";
                    break;
                case "npc":
                    data.img = "systems/akrel/assets/icons/loot.png";
                    break;
                default:
                    data.img = "systems/akrel/assets/icons/loot.png";
            }
        }
        await super.create(data, options);
    }

    /** @override */
    prepareData() {
        // Calling the super version of this executes:
        // data reset (to clear active effects),
        // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
        // prepareDerivedData().
        super.prepareData();
    }

    prepareDerivedData() {
        // Appelle la méthode dispatcher pour la préparation des données dérivées
        this._prepareAkrelActorData();
    }

    /**
     * Dispatcher pour la préparation des données dérivées spécifiques au type.
     * @private
     */
    _prepareAkrelActorData() {
        // Accède directement aux données du système via 'this.system'
        const systemData = this.system;

        // Dispatche la logique de préparation en fonction du type de l'acteur
        switch (this.type) {
            case 'character':
                this._prepareCharacterData(systemData);
                break;
            case 'npc':
                this._._prepareNpcData(systemData);
                break;
            // Ajoutez d'autres cas si vous avez d'autres types d'acteurs
        }
    }

    /**
     * Prépare les données dérivées spécifiquement pour les acteurs de type 'character'.
     * @param {object} characterData Le sous-objet 'system' de l'acteur pour un personnage.
     * @private
     */
    _prepareCharacterData(characterData) {
        // Assurez-vous que cette méthode ne s'exécute que pour les 'character'
        if (this.type !== 'character') return;

        // Votre logique de préparation des données dérivées de personnage ici
        console.log(`AKREL | Préparation des données dérivées pour le personnage ${this.name}`);
    };

    /**
     * Prépare les données dérivées spécifiquement pour les acteurs de type 'npc'.
     * @param {object} npcData Le sous-objet 'system' de l'acteur pour un PNJ.
     * @private
     */
    _prepareNpcData(npcData) {
        if (this.type !== 'npc') return;

        // Votre logique de préparation des données dérivées de PNJ ici
        console.log(`AKREL | Préparation des données dérivées pour le PNJ ${this.name}`);
    }
}