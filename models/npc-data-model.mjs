
export class NPCDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const { SchemaField, StringField, NumberField, BooleanField, HTMLField, ArrayField, ObjectField } = foundry.data.fields;
        
        const caracsSchema = new SchemaField({
            social: new NumberField({ initial: 0}),
            physical: new NumberField({ initial: 0}),
            intelligence: new NumberField({ initial: 0 }),
            dexterity: new NumberField({ initial: 0}),
            initiative: new NumberField({ initial: 0}),
            block: new NumberField({ initial: 0}),
            dodge: new NumberField({ initial: 0}),
            vigilance: new NumberField({ initial: 0 })
        });

        let data = {
            caracs: caracsSchema,

            level: new NumberField({initial: 1}),
            job: new StringField({initial: ""}),
            age: new StringField({initial: ""}),
            origin: new StringField({initial: ""}),
            gender: new StringField({initial: ""}),
            size: new StringField({initial: ""}),
            morphology: new StringField({initial: ""}),
            caste: new StringField({initial: ""}),
            divinity: new StringField({initial: ""}),
            alignment: new StringField({initial: ""}),
            experience: new NumberField({initial: 0}),
            story: new HTMLField({initial: ""}),

            resources: new SchemaField({
                health: new SchemaField({
                    value: new NumberField({ initial: 10}),
                    max: new NumberField({ initial: 10 })
                }, { label: "AKREL.RESOURCES.HEALTH" }), // Label correctement placé en option de SchemaField
                mana: new SchemaField({
                    value: new NumberField({ initial: 5}),
                    max: new NumberField({ initial: 5 })
                }, { label: "AKREL.RESOURCES.MANA" }), // Label correctement placé en option de SchemaField
            }),

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
    }

    prepareDerivedData() {
       // Assurez-vous que la valeur actuelle de la santé ne dépasse pas son maximum
        this.resources.health.value = Math.min(this.resources.health.value , this.resources.health.max);

        // same for mana
        this.resources.mana.value = Math.min(this.resources.mana.value, this.resources.mana.max);
    }

    static migrateData(source) {
        return super.migrateData(source);
    }
}