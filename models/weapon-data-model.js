export class WeaponDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        // Correction: Numberfield -> NumberField
        const {StringField, NumberField, HTMLField } = foundry.data.fields;
        let data = {
            description: new HTMLField({initial: ""}),
            weaponType: new StringField({initial: ""}),
            durability: new StringField({initial: ""}), 
            attackAttribute: new StringField({initial: ""}),
            damageDice: new StringField({initial: ""}),
            price: new NumberField({initial: 1}),
            nature: new StringField({initial: ""}),
            enchantment: new StringField({initial: ""}),
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