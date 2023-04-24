/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([

    // Actor partials.
    "systems/tpo/templates/actor/parts/actor-features.html",
    "systems/tpo/templates/actor/parts/actor-items.html",
    "systems/tpo/templates/actor/parts/actor-abilities.html",
    "systems/tpo/templates/actor/parts/actor-effects.html",
    "systems/tpo/templates/actor/parts/actor-combat.html",
    "systems/tpo/templates/actor/parts/actor-notes.html",

    // LargeNPC Partials
    "systems/tpo/templates/actor/parts/largenpc-features.html",
  ]);
};
