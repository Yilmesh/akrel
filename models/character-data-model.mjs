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
        const caracsSchema = new SchemaField({
            social: new NumberField({ initial: 1}),
            physical: new NumberField({ initial: 1}),
            intelligence: new NumberField({ initial: 1}),
            dexterity: new NumberField({ initial: 1}),
            initiative: new NumberField({ initial: 1}),
            block: new NumberField({ initial: 1}),
            dodge: new NumberField({ initial: 1}),
            vigilance: new NumberField({ initial: 1})
        });


        // Définition du schéma global des données de l'acteur de type "character"
        let data = {
            // Stats de base
            caracs: caracsSchema,

            // Champs généraux descriptifs du personnage
            experience: new NumberField({ initial: 0}),
            level: new NumberField({ initial: 1}),
            job: new StringField({ initial: ""}),
            age: new StringField({ initial: ""}),
            morphology: new StringField({ initial: ""}),
            origin: new StringField({ initial: ""}),
            caste: new StringField({ initial: ""}),
            gender: new StringField({ initial: ""}),
            divinity: new StringField({ initial: ""}),
            size: new StringField({ initial: ""}),
            alignment: new StringField({ initial: ""}),
            story: new HTMLField({ initial: " votre histoire commence ici"}),

            // Ressources du personnage - DÉFINITION CORRIGÉE DU LABEL
            resources: new SchemaField({
                health: new SchemaField({
                    value: new NumberField({ initial: 10}),
                    max: new NumberField({ initial: 10 })
                }, { label: "AKREL.RESOURCES.HEALTH" }), // Label correctement placé en option de SchemaField
                mana: new SchemaField({
                    value: new NumberField({ initial: 5}),
                    max: new NumberField({ initial: 5 })
                }, { label: "AKREL.RESOURCES.MANA" }), // Label correctement placé en option de SchemaField
                armor: new SchemaField({
                    value: new NumberField({ initial: 1 }),
                    max: new NumberField({ initial: 1 })
                }, { label: "AKREL.RESOURCES.ARMOR" }), // Label correctement placé en option de SchemaField
                barrier: new SchemaField({
                    value: new NumberField({ initial: 1 }),
                    max: new NumberField({ initial: 1 })
                }, { label: "AKREL.RESOURCES.BARRIER" }) // Label correctement placé en option de SchemaField
            }),

            // Membres du groupe (pour le suivi des PNJ ou alliés du personnage)
            groupMembers: new ArrayField(new SchemaField({
                name: new StringField({ initial: "" }),
                opinion: new HTMLField({ initial: "" })
            }), { initial: []})
        };

        return data;
    }

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
        // Assurez-vous que la valeur actuelle de la santé ne dépasse pas son maximum
        this.resources.health.value = Math.min(this.resources.health.value , this.resources.health.max);

        // same for mana
        this.resources.mana.value = Math.min(this.resources.mana.value, this.resources.mana.max);

        // Armor
        this.resources.armor.value = Math.min(this.resources.armor.value, this.resources.armor.max);

        // Barrier
        this.resources.barrier.value = Math.min(this.resources.barrier.value, this.resources.barrier.max);
    }

    static migrateData(source){
        return super.migrateData(source);
    }
}