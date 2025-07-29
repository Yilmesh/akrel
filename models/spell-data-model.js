// systems/akrel/module/data/item/SpellDataModel.js
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
            manaCost: new NumberField({initial:0})
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