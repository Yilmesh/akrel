export default class akrelItemSheet extends ItemSheet {
    get template() {
        return `systems/akrel/templates/sheets/item/${this.item.type}-sheet.hbs`;
    }

    getData() {
        const data = super.getData();

        data.config = CONFIG.akrel;

        return data;
    }
}