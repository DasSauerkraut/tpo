// Import document classes.
import { tpoActor } from "./documents/actor.mjs";
import { tpoItem } from "./documents/item.mjs";
// Import sheet classes.
import { tpoActorSheet } from "./sheets/actor-sheet.mjs";
import { tpoItemSheet } from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { TPO } from "./helpers/config.mjs";
import { DiceTPO, UtilsTPO } from "./helpers/utilities.mjs";


/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function() {

  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.tpo = {
    tpoActor,
    tpoItem,
    rollItemMacro
  };

  // Add custom constants for configuration.
  CONFIG.TPO = TPO;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "1d10 + @stats.agi.bonus",
    decimals: 2
  };

  // Define custom Document classes
  CONFIG.Actor.documentClass = tpoActor;
  CONFIG.Item.documentClass = tpoItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("tpo", tpoActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("tpo", tpoItemSheet, { makeDefault: true });

  CONFIG.statusEffects = TPO.statuses;

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here are a few useful examples:
Handlebars.registerHelper('concat', function() {
  var outStr = '';
  for (var arg in arguments) {
    if (typeof arguments[arg] != 'object') {
      outStr += arguments[arg];
    }
  }
  return outStr;
});

Handlebars.registerHelper('toLowerCase', function(str) {
  return str.toLowerCase();
});

Handlebars.registerHelper("greaterThan", function(operand_1, operand_2, options) {
  if(operand_1 > operand_2) return options.fn(this);
  return options.inverse(this);
});

Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('ifNotEqual', function (a, b, options) {
  if (a != b) { return options.fn(this); }
  return options.inverse(this);
});

Handlebars.registerHelper('select', function(value, options) {
  var select = document.createElement('select'); // create a select element
  select.innerHTML = options.fn(this);           // populate it with the option HTML
  select.value = value;                          // set the value
  var g = 0, i = select.selectedIndex;           // calculate which index of which optgroup
  if(select.children[g].children.length !== 0){
    while (i >= select.children[g].children.length) { i -= select.children[g].children.length; g++; }
    if (select.children[g].children[i]) {          // if selected node exists add 'selected' attribute
        select.children[g].children[i].setAttribute('selected', true);
    }
  } else if (select.children[select.selectedIndex]) {
    select.children[select.selectedIndex].setAttribute('selected', 'selected');
  }
  return select.innerHTML;
});


/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function() {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));
});

Hooks.on("updateCombat", (combat) => {
  UtilsTPO.onRoundChange(combat);
})

Hooks.on("getChatLogEntryContext", (html, options) => {
  UtilsTPO.addResolveRerollToChatCard(options);
  UtilsTPO.addSplendorRerollToChatCard(options);
});

Hooks.on("preUpdateActor", (actor, data, diff) => {
  if(UtilsTPO.isInCombat(actor.data._id) && data.data.derived.hp?.value < actor.data.data.derived.hp?.value && diff.diff){
    const damageTaken = actor.data.data.derived.hp.value - data.data.derived.hp.value;
    if(damageTaken >= 10)
      UtilsTPO.playContextSound({type: "damage"}, "major")
    else if (damageTaken >= 3)
      UtilsTPO.playContextSound({type: "damage"}, "normal")
    else
      UtilsTPO.playContextSound({type: "damage"}, "minor")
    
    const tempHp = actor.data.data.derived.tempHp.value
    if(tempHp > 0){
      let chatContent = ''

      if(tempHp - damageTaken >= 0){
        data.data.derived = {
          hp: {
            value: actor.data.data.derived.hp.value
          },
          tempHp: {
            value: tempHp - damageTaken
          }
        }
        chatContent = `
        <b>${actor.data.name}</b><br>
        <div>Temp. HP absorbs the blow!<br>Temp. HP: ${tempHp} ??? ${tempHp - damageTaken}</div>
        `
      } else {
        data.data.derived = {
          hp: {
            value: actor.data.data.derived.hp.value - (damageTaken - tempHp)
          },
          tempHp: {
            value: 0
          }
        }
        chatContent = `
        <b>${actor.data.name}</b><br>
        <div>Temp. HP softens the blow!
        <br>Temp. HP: ${tempHp} ??? ${0}
        <br>HP: ${actor.data.data.derived.hp.value} ??? ${actor.data.data.derived.hp.value - (damageTaken - tempHp)}</div>
        `
      }
      let chatData = {
        content: chatContent,
        user: game.user._id,
      };
      ChatMessage.create(chatData, {});
    }
  }
})

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  if (data.type !== "Item") return;
  if (!("data" in data)) return ui.notifications.warn("You can only create macro buttons for owned Items");
  const item = data.data;

  // Create the macro command
  const command = `game.tpo.rollItemMacro("${item.name}");`;
  let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "tpo.itemMacro": true }
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
function rollItemMacro(itemName) {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  const item = actor ? actor.items.find(i => i.name === itemName) : null;
  if (!item) return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`);

  // Trigger the item roll
  return item.roll();
}