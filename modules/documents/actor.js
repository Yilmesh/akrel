// systems/akrel/modules/documents/actor.js

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

        console.log(`AKREL | Préparation des données dérivées pour le personnage ${this.name}`);
    }
    /**
     * @param {object} npcData  
     * @private
     */

    _prepareNpcData(npcData) {
        if (this.type !== 'npc') return;

        console.log(`AKREL | Préparation des données dérivées pour le PNJ ${this.name}`);
    }
}