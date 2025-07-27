// systems/akrel/modules/helpers/handlebars-helper.js

export function registerHandlebarsHelpers() {
    /**
     * Helper pour calculer un pourcentage (value / max * 100).
     * S'assure que le pourcentage est un nombre valide, même si max est 0.
     */
    Handlebars.registerHelper("percent", function(value, max) {
        if (typeof value !== 'number' || typeof max !== 'number' || max === 0) {
            return 0;
        }
        return (value / max) * 100;
    });

    /**
     * Helper pour retourner le maximum entre plusieurs valeurs.
     * Utile pour s'assurer qu'une barre ne soit pas négative, par exemple.
     */
    Handlebars.registerHelper("max", function(...args) {
        // Le dernier argument est toujours un objet Handlebars, il doit être ignoré
        const options = args.pop();
        // S'assurer que tous les arguments restants sont des nombres avant de trouver le max
        const numericArgs = args.filter(arg => typeof arg === 'number');
        if (numericArgs.length === 0) {
            return 0; // Retourne 0 si aucun nombre n'est fourni
        }
        return Math.max(...numericArgs);
    });

    /**
     * Helper pour vérifier si deux valeurs sont de même type.
     */
    Handlebars.registerHelper('isType', function(type, compare) {
        return type === compare;
    });

    /**
     * Helper pour vérifier si la première valeur est supérieure à la deuxième.
     */
    Handlebars.registerHelper('gt', function(a, b) {
        return a > b;
    });

    /**
     * Helper pour vérifier si la première valeur est inférieure à la deuxième.
     */
    Handlebars.registerHelper('lt', function(a, b) {
        return a < b;
    });

    /**
     * Helper pour soustraire deux valeurs.
     */
    Handlebars.registerHelper('subtract', function(a, b) {
        return a - b;
    });

    console.log("AKREL System | Handlebars helpers registered.");
}