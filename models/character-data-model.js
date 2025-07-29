/**
 * Modèle de données pour les acteurs de type "personnage" (Character).
 * Définit la structure des données du système d'un personnage Akrel.
 * @extends {foundry.abstract.TypeDataModel}
 */
export class CharacterDataModel extends foundry.abstract.TypeDataModel {

    /**
     * Définit le schéma des données pour le personnage.
     * C'est ici que vous structurez toutes les propriétés du champ 'system' de votre acteur.
     * @returns {object} Le schéma de données.
     */
    static defineSchema() {
        const { SchemaField, StringField, NumberField, BooleanField, HTMLField, ArrayField, ObjectField } = foundry.data.fields;

        // Schéma pour les statistiques de base du personnage (Social, Physique, etc.)
        const baseStatsSchema = new SchemaField({
            social: new NumberField({ initial: 0, min: 0, integer: true, label: "AKREL.ATTRIBUTES.SOCIAL" }),
            physical: new NumberField({ initial: 0, min: 0, integer: true, label: "AKREL.ATTRIBUTES.PHYSICAL" }),
            intelligence: new NumberField({ initial: 0, min: 0, integer: true, label: "AKREL.ATTRIBUTES.INTELLIGENCE" }),
            dexterity: new NumberField({ initial: 0, min: 0, integer: true, label: "AKREL.ATTRIBUTES.DEXTERITY" }),
            initiative: new NumberField({ initial: 0, min: 0, integer: true, label: "AKREL.ATTRIBUTES.INITIATIVE" }),
            block: new NumberField({ initial: 0, min: 0, integer: true, label: "AKREL.ATTRIBUTES.BLOCK" }),
            dodge: new NumberField({ initial: 0, min: 0, integer: true, label: "AKREL.ATTRIBUTES.DODGE" }),
            vigilance: new NumberField({ initial: 0, min: 0, integer: true, label: "AKREL.ATTRIBUTES.VIGILANCE" })
        });


        // Définition du schéma global des données de l'acteur de type "character"
        let data = {
            // Stats de base
            baseStats: baseStatsSchema,

            // Champs généraux descriptifs du personnage
            job: new StringField({ initial: "", blank: true, label: "AKREL.CHARACTER.JOB" }),
            experience: new NumberField({ initial: 0, min: 0, integer: true, label: "AKREL.CHARACTER.XP" }),
            level: new NumberField({ initial: 1, min: 1, integer: true, label: "AKREL.CHARACTER.LEVEL" }),
            age: new StringField({ initial: "", blank: true, label: "AKREL.CHARACTER.AGE" }),
            morphology: new StringField({ initial: "", blank: true, label: "AKREL.CHARACTER.MORPHOLOGY" }),
            origin: new StringField({ initial: "", blank: true, label: "AKREL.CHARACTER.ORIGIN" }),
            caste: new StringField({ initial: "", blank: true, label: "AKREL.CHARACTER.CASTE" }),
            gender: new StringField({ initial: "", blank: true, label: "AKREL.CHARACTER.GENDER" }),
            divinity: new StringField({ initial: "", blank: true, label: "AKREL.CHARACTER.DIVINITY" }),
            size: new StringField({ initial: "", blank: true, label: "AKREL.CHARACTER.SIZE" }),
            alignment: new StringField({ initial: "", blank: true, label: "AKREL.CHARACTER.ALIGNMENT" }),
            story: new HTMLField({ initial: "", blank: true, label: "AKREL.CHARACTER.STORY" }),

            // Ressources du personnage - DÉFINITION CORRIGÉE DU LABEL
            resources: new SchemaField({
                health: new SchemaField({
                    value: new NumberField({ initial: 10, min: 0, integer: true }),
                    max: new NumberField({ initial: 10, min: 0, integer: true })
                }, { label: "AKREL.RESOURCES.HEALTH" }), // Label correctement placé en option de SchemaField
                mana: new SchemaField({
                    value: new NumberField({ initial: 5, min: 0, integer: true }),
                    max: new NumberField({ initial: 5, min: 0, integer: true })
                }, { label: "AKREL.RESOURCES.MANA" }), // Label correctement placé en option de SchemaField
                armor: new SchemaField({
                    value: new NumberField({ initial: 0, min: 0, integer: true }),
                    max: new NumberField({ initial: 0, min: 0, integer: true })
                }, { label: "AKREL.RESOURCES.ARMOR" }), // Label correctement placé en option de SchemaField
                barrier: new SchemaField({
                    value: new NumberField({ initial: 0, min: 0, integer: true }),
                    max: new NumberField({ initial: 0, min: 0, integer: true })
                }, { label: "AKREL.RESOURCES.BARRIER" }) // Label correctement placé en option de SchemaField
            }),

            // Membres du groupe (pour le suivi des PNJ ou alliés du personnage)
            groupMembers: new ArrayField(new SchemaField({
                name: new StringField({ initial: "", blank: true, label: "AKREL.SHEET.GROUP_MEMBER_NAME" }),
                opinion: new HTMLField({ initial: "", blank: true, label: "AKREL.SHEET.GROUP_MEMBER_OPINION" })
            }), { initial: [], label: "AKREL.SHEET.GROUP_MEMBERS" })
        };

        return data;
    }

    /**
     * Accesseur pratique pour l'acteur parent de ce modèle de données.
     * @returns {Actor} L'acteur parent.
     */
    get actor() {
        return this.parent;
    }

    /**
     * Prépare les données dérivées du personnage.
     * Ces calculs sont effectués à la volée et ne sont pas stockés dans la base de données.
     * C'est ici que les mécaniques de jeu pour les stats calculées sont implémentées.
     * Ajoutez votre propre logique de calcul ici.
     */
    prepareDerivedData() {
        // --- Votre logique de calcul des données dérivées pour les personnages Akrel ici ---
        // Exemple: Calcul de l'initiative finale basée sur la Dextérité et l'Intelligence
        // this.baseStats.initiative = this.baseStats.dexterity + this.baseStats.intelligence;

        // Exemple: Calcul du total de points de vie maximum basé sur la Physique et le Niveau
        // this.resources.health.max = this.baseStats.physical * 2 + (this.level * 5);
        // Assurez-vous que la valeur actuelle ne dépasse pas le nouveau maximum
        // this.resources.health.value = Math.min(this.resources.health.value, this.resources.health.max);
    }

    /**
     * Effectue des migrations de données à partir d'un schéma source vers le schéma actuel.
     * Cette version s'appuie entièrement sur la logique de migration par défaut de Foundry VTT.
     * @param {object} source Les données brutes de l'acteur avant la migration.
     * @param {object} migration Les champs de migration à appliquer.
     * @protected
     * @override
     */
    _onMigrateSchema(source, migration) {
        // Appelle la méthode de migration par défaut de la classe parente.
        // C'est elle qui gère l'ajout des nouveaux champs définis dans defineSchema()
        // avec leurs valeurs initiales, si elles n'existent pas dans les données source.
        super._onMigrateSchema(source, migration);

        // Aucune logique de migration personnalisée n'est ajoutée ici,
        // s'appuyant uniquement sur les fonctionnalités de base de Foundry.

        return source;
    }
}