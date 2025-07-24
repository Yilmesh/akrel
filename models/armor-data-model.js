export class ArmorDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        // Correction: Numberfield -> NumberField
        const {StringField, NumberField, HTMLField } = foundry.data.fields;
        let data = {
            description: new HTMLField({initial: ""}),
            wornLocation: new StringField({initial: ""}),
            price: new NumberField({initial: 1}), 
            durability: new StringField({initial: ""}),
            defensePoints: new NumberField({initial: 1}),
            enchantment: new StringField({initial: ""}),
            armorType: new StringField({initial: ""})
        }

        return data;
    }

    // Correction: _initilize -> _initialize
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