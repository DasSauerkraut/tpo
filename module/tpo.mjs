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

  game.system.rollDiceTpo = DiceTPO.rollTest;

  game.settings.register("tpo", "Xp2", {
    name: 'Use updated XP formulas.',
    hint: 'Use the new formualas for XP costs, lock free stat improvements to the stat that governs the skill.',
    scope: 'world',     // "world" = sync to db, "client" = local storage
    config: true,       // false if you dont want it to show in module config
    type: Boolean,       // Number, Boolean, String, Object
    default: false,
    onChange: value => { // value is the new value of the setting
      console.log(value)
    },
  })

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
  // console.log(operand_1)
  // console.log(operand_2)
  if(operand_1 > operand_2) return options.fn(this);
  return options.inverse(this);
});

Handlebars.registerHelper("greaterThanEq", function(operand_1, operand_2, options) {
  if(operand_1 >= operand_2) return options.fn(this);
  return options.inverse(this);
});

Handlebars.registerHelper("lessThan", function(operand_1, operand_2, options) {
  if(operand_1 < operand_2) return options.fn(this);
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

Handlebars.registerHelper("math", function(lvalue, operator, rvalue, options) {
  lvalue = parseFloat(lvalue);
  rvalue = parseFloat(rvalue);
      
  return {
      "+": lvalue + rvalue,
      "-": lvalue - rvalue,
      "*": lvalue * rvalue,
      "/": lvalue / rvalue,
      "%": lvalue % rvalue
  }[operator];
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
});

Hooks.on("preUpdateActor", (actor, data, diff) => {
  if(UtilsTPO.isInCombat(actor._id) && data.system?.derived?.hp?.value < actor.system.derived.hp?.value && diff.diff){
    const damageTaken = actor.system.derived.hp.value - data.system.derived.hp.value;
    if(damageTaken >= 10)
      UtilsTPO.playContextSound({type: "damage"}, "major")
    else if (damageTaken >= 3)
      UtilsTPO.playContextSound({type: "damage"}, "normal")
    else
      UtilsTPO.playContextSound({type: "damage"}, "minor")
    
    const tempHp = actor.system.derived.tempHp.value
    let chatContent = ''
    if(tempHp > 0){
      if(tempHp - damageTaken >= 0){
        data.system.derived = {
          hp: {
            value: actor.system.derived.hp.value
          },
          tempHp: {
            value: tempHp - damageTaken
          }
        }
        chatContent += `
        <b>${actor.name}</b><br>
        <div>Temp. HP absorbs the blow!<br>Temp. HP: ${tempHp} → ${tempHp - damageTaken}</div>
        `
      } else {
        data.system.derived = {
          hp: {
            value: actor.system.derived.hp.value - (damageTaken - tempHp)
          },
          tempHp: {
            value: 0
          }
        }
        chatContent += `
        <b>${actor.name}</b><br>
        <div>Temp. HP softens the blow!
        <br>Temp. HP: ${tempHp} → ${0}
        <br>HP: ${actor.system.derived.hp.value} → ${actor.system.derived.hp.value - (damageTaken - tempHp)}</div>
        `
      }
    }
    if(actor.system.derived.hp?.value > actor.system.derived.bloodied?.value && data.system.derived.hp?.value <= actor.system.derived.bloodied?.value){
      chatContent += `
        ${chatContent !== '' ? '<hr>': ''}<b>${actor.name} is Bloodied!</b><br>
        <div>They suffer a Minor Injury and must perform a Morale Test.
        </div>
        `
    }
    if(actor.system.derived.hp?.value > 0 && data.system.derived.hp?.value <= 0){
      chatContent += `
        ${chatContent !== '' ? '<hr>': ''}<b>${actor.name} is Downed!</b><br>
        <div>They suffer a Major Injury and their allies must perform a Morale Test. Furthermore, any clothing they were wearing is ruined and must be repaired or it will have -1 Splendor!
        </div>
        `
      if(data.system.derived.hp?.value <= actor.system.derived.tempHp.max * -1){
        chatContent += `
          <br><b>Instant Death!</b>
          <div>${actor.name} must succeed a <b>Hard (-20) Endurance Test</b> or immediately die.</div>
        `
      }
    }
    let chatData = {
      content: chatContent,
      user: game.user._id,
    };
    if(chatContent !== '')
      ChatMessage.create(chatData, {});
  }
})

Hooks.on("preUpdateItem", (item, data, diff) => {
  if(item.type !== "zone")
    return;
  
  const actor = item.parent

  if(data.system?.hp?.value !== item.system.hp?.value && diff.diff){
    if(data.system.hp.value < 0)
      data.system.hp.value = item.system.hp.value + data.system.hp.value;

    const hpDiff = data.system.hp.value - item.system.hp.value
    if(hpDiff < 0 && actor){
      actor.update({[`system.derived.hp.value`]: actor.system.derived.hp.value + hpDiff })
    }

    if(item.system.hp.value + hpDiff <= 0 && !data.flags?.tpo?.broken) {
      data['flags'] = {'tpo': {
        'broken': true
      }}
      if(actor){
        const chatContent = `
          <b>${actor.name}'s ${item.name} has broken!</b><br>
          <div>They must perform a Morale Test and cannot use Special powers from this zone!<br>
          They also suffer the following effect(s):
          ${item.system.brokenEffect}
          </div>
          `  
        const chatData = {
          content: chatContent,
          user: game.user._id,
        };
        ChatMessage.create(chatData, {});
      }
    } else if (item.system.hp.value + hpDiff > 0 && data.flags?.tpo?.broken){
      data['flags'] = {'tpo': {
        'broken': false
      }}
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