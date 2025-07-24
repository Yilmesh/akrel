/**
 * Extend the base Item document to support attributes and groups with a custom template creation dialog.
 * @extends {Item}
 */
export class AKRELItem extends Item {
    static async create(data, options = {}) {
        // Replace default image
        if (data.img === undefined) {

            switch(data.type) {
                case "weapon":
                    data.img = "systems/akrel/assets/icons/weapon.svg";
                    break;

                case "armor":
                    data.img = "systems/akrel/assets/icons/armor.png";
                    break;

                case "loot":
                    data.img = "systems/akrel/assets/icons/loot.png";
                    break;

                case "spell":
                    data.img = "systems/akrel/assets/icons/spell.svg";
                    break;

                case "passive":
                    data.img = "systems/akrel/assets/icons/spell.png";
                    break;
            }
        }

        await super.create(data, options);
    }
}
