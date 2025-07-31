export class SpellDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const {StringField, NumberField, HTMLField, BooleanField } = foundry.data.fields;
        let data = {
            description: new HTMLField({initial:""}),
            spellNature: new StringField({initial:""}),  
            spellLevel: new NumberField({initial:1}),    
            attackAttribute: new StringField({initial:""}), 
            dice: new StringField({initial:""}),            
            isQuickSpell: new BooleanField({initial:false}),
            manaCost: new NumberField({initial:0}),         
            spellType: new StringField({ 
                initial: "utility", 
                choices: {
                    "utility": "AKREL.SKILL_TYPES.UTILITY",     // Ex: "Allumer un feu" (jet, mais sans dés de dégâts/soins)
                    "offensive": "AKREL.SKILL_TYPES.OFFENSIVE", // Ex: "Boule de feu", "Saut du guerrier" (implique des dégâts)
                    "healing": "AKREL.SKILL_TYPES.HEALING"     // Ex: "Soin léger", "Bouclier protecteur" (soins/buffs)
                },
                localize: true // Indique que les valeurs des choix doivent être localisées
            })
        }
        return data;
    }

    _initialize(options = {}) {
        super._initialize(options);
    }

    get item() {
        return this.parent;
    }

    prepareBaseData() {
    }

    prepareDerivedData() {
    }

    static migrateData(source){
        return super.migrateData(source);
    }
}