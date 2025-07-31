export class NPCDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const {SchemaField, StringField, NumberField, BooleanField, HTMLField} = foundry.data.fields;
        
        let data = {
            age: new StringField({initial: ""}),
            origin: new StringField({initial: ""}),
            gender: new StringField({initial: ""}),
            size: new StringField({initial: ""}),
            morphology: new StringField({initial: ""}),
            caste: new StringField({initial: ""}),
            divinity: new StringField({initial: ""}),
            alignment: new StringField({initial: ""}),
            experience: new NumberField({initial: 0}),
            story: new HTMLField({initial: ""})

        }

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
       
    }

    static migrateData(source) {
        return super.migrateData(source);
    }
}