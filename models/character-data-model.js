// systems/akrel/module/data/CharacterDataModel.js

export class CharacterDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const {SchemaField, StringField, NumberField, BooleanField, HTMLField, ArrayField, ObjectField} = foundry.data.fields;
        
        let data = {
            age: new StringField({initial:""}),
            origin: new StringField({initial:""}),
            gender: new StringField({initial:""}),
            size: new StringField({initial:""}),
            morphology: new StringField({initial:""}),
            caste: new StringField({initial:""}),
            divinity: new StringField({initial:""}),
            alignment: new StringField({initial:""}),
            experience: new NumberField({initial:0}),
            level: new NumberField({ initial: 1, min: 0, integer: true }), // Ajout du champ niveau
            story: new HTMLField({initial:""}),
            groupMembers: new ArrayField(
                new ObjectField({
                    required: true,
                    initialKeys: {
                        name: new StringField({ required: true, initial: "", blank: true }),
                        opinion: new StringField({ required: true, initial: "", blank: true })
                    }
                }),
                { required: true, initial: [] }
            ),
            
            resources: new SchemaField({
                health: new SchemaField({
                    value: new NumberField({ initial: 10, min: 0, integer: true }),
                    max: new NumberField({ initial: 10, min: 0, integer: true })
                }),
                mana: new SchemaField({
                    value: new NumberField({ initial: 5, min: 0, integer: true }),
                    max: new NumberField({ initial: 5, min: 0, integer: true })
                }),
                // --- NOUVEAU : Définition des ressources Armure et Barrière ---
                armor: new SchemaField({
                    value: new NumberField({ initial: 0, min: 0, integer: true }),
                    max: new NumberField({ initial: 0, min: 0, integer: true })
                }),
                barrier: new SchemaField({
                    value: new NumberField({ initial: 0, min: 0, integer: true }),
                    max: new NumberField({ initial: 0, min: 0, integer: true })
                })
                // --- FIN NOUVEAU ---
            })
        };
        return data;
    }

    _initialize(options = {}) {
        super._initialize(options);
    }

    get actor() {
        return this.parent;
    }

    prepareBaseData() {
        // Optionnel : s'assurer que les valeurs actuelles ne dépassent pas les valeurs maximales
        for (const res of ["health", "mana", "armor", "barrier"]) {
            if (this.resources[res].value > this.resources[res].max) {
                this.resources[res].value = this.resources[res].max;
            }
        }
    }

    prepareDerivedData() {
        // Ici, vous pourriez calculer des valeurs dérivées si nécessaire
    }

    static migrateData(source) {
        // Logique de migration si vous aviez des acteurs sans ressources ou niveau
        if (!source.resources) {
            source.resources = {
                health: { value: 10, max: 10 },
                mana: { value: 5, max: 5 },
                armor: { value: 0, max: 0 }, // Valeurs initiales pour l'armure
                barrier: { value: 0, max: 0 } // Valeurs initiales pour la barrière
            };
        }
        if (source.level === undefined) { // Migrer le niveau si inexistant
            source.level = 1;
        }
        // ... (votre logique de migration existante pour groupMembers et yourGroup)
        if (typeof source.yourGroup === "string") {
            delete source.yourGroup; 
        }
        return super.migrateData(source);
    }
}