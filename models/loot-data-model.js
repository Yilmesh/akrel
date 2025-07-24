export class LootDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        // Correction: Numberfield -> NumberField
        const {NumberField, HTMLField } = foundry.data.fields;
        let data = {
            description: new HTMLField({initial: ""}),
            price: new NumberField({initial: 1})
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