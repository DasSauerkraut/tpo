/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class tpoItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  async prepareData() {
    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData();
    this.data.data.descriptionDisplay = this.formatDescription(this.data.data.description)
    if(this.data.data.value)
      this.data.data.value.total = (this.data.data.value.l + this.data.data.value.s/20 + this.data.data.value.c/200).toFixed(2)
    
    if(this.data.type === "armament"){
      this.data.data.damage.value = this.data.data.damage.base + this.data.data.damage.upgrades;
      this.data.data.elementDamage.value = this.data.data.elementDamage.base + this.data.data.elementDamage.upgrades;

      if(this.data.data.powers.length !== 0){
        var sort = {"At-Will": 1, "Encounter": 2, "Weekly": 3}
        this.data.data.powers.sort((a, b) => {
          return sort[a.data.type] - sort[b.data.type];
        })
      }
    }
    if(this.data.type === "ability"){
      this.data.data.value = this.data.data.improvements + this.data.data.mod - this.data.data.malus;
      this.data.data.level = Math.floor(this.data.data.value / 20)
    }
    if(this.data.type === "power"){
      if(this.data.data.attacks === undefined)
        this.data.data.attacks = 1;
    }
  }

  formatDescription(description){
    if(!this.actor || !this.actor.data || !description)
      return;
    //ws
    description = description.replaceAll("((@ws))", this.actor.getStatData("ws"))
    description = description.replaceAll("((@wsb))", this.actor.getStatData("ws", true))
    //str
    description = description.replaceAll("((@str))", this.actor.getStatData("str"))
    description = description.replaceAll("((@strb))", this.actor.getStatData("str", true))
    //con
    description = description.replaceAll("((@con))", this.actor.getStatData("con"))
    description = description.replaceAll("((@conb))", this.actor.getStatData("con", true))
    //agi
    description = description.replaceAll("((@agi))", this.actor.getStatData("agi"))
    description = description.replaceAll("((@agib))", this.actor.getStatData("agi", true))
    //dex
    description = description.replaceAll("((@dex))", this.actor.getStatData("dex"))
    description = description.replaceAll("((@dexb))", this.actor.getStatData("dex", true))
    //int
    description = description.replaceAll("((@int))", this.actor.getStatData("int"))
    description = description.replaceAll("((@intb))", this.actor.getStatData("int", true))
    //will
    description = description.replaceAll("((@will))", this.actor.getStatData("will"))
    description = description.replaceAll("((@willb))", this.actor.getStatData("will", true))
    //cha
    description = description.replaceAll("((@cha))", this.actor.getStatData("cha"))
    description = description.replaceAll("((@chab))", this.actor.getStatData("cha", true))

    //Power Keywords
    //Delay
    const delayRegExp = /(Delay )(\d+)/g
    const delayMatches = [...description.matchAll(delayRegExp)]
    delayMatches.forEach(match => {
      description = description.replace(match[0], `<a class='rollable' title="${game.i18n.format("KEYWORD.Delay").replaceAll("NUM", match[2])}"><b>Delay ${match[2]}</b></a>`)
    })
    //Flexible
    description = description.replaceAll("Flexible", `<a class='rollable' title="${game.i18n.format("KEYWORD.Flexible")}"><b>Flexible</b></a>`)
    //Leech
    const leechRegExp = /(Leech )(\d+)/g
    const leechMatches = [...description.matchAll(leechRegExp)]
    leechMatches.forEach(match => {
      description = description.replace(match[0], `<a class='rollable' title="${game.i18n.format("KEYWORD.Leech").replaceAll("NUM", match[2])}"><b>Leech ${match[2]}</b></a>`)
    })
    //Optional
    description = description.replaceAll("Optional", `<a class='rollable' title="${game.i18n.format("KEYWORD.Optional")}"><b>Optional</b></a>`)
    //Piercing
    description = description.replaceAll("Piercing", `<a class='rollable' title="${game.i18n.format("KEYWORD.Piercing")}"><b>Piercing</b></a>`)
    //Reactive
    description = description.replaceAll("Reactive", `<a class='rollable' title="${game.i18n.format("KEYWORD.Reactive")}"><b>Reactive</b></a>`)
    // Launched
    const launchRegExp = /(Launch )(\d+)/g
    const launchMatches = [...description.matchAll(launchRegExp)]
    launchMatches.forEach(match => {
      description = description.replace(match[0], `
      <a class='rollable' title="${
        game.i18n.format("KEYWORD.Launch")
        .replaceAll("½ NUM", match[2] * 0.5)
        .replaceAll("NUM", match[2])
      }"><b>Launch ${match[2]}</b></a>`)
    })
    const launchedRegExp = /(Launched )(\d+)/g
    const launchedMatches = [...description.matchAll(launchedRegExp)]
    launchedMatches.forEach(match => {
      description = description.replace(match[0], `
      <a class='rollable' title="${
        game.i18n.format("KEYWORD.Launch")
        .replaceAll("½ NUM", match[2] * 0.5)
        .replaceAll("NUM", match[2])
      }"><b>Launched ${match[2]}</b></a>`)    })
    // Weak
    description = description.replaceAll("Weak", `<a class='rollable' title="${game.i18n.format("KEYWORD.Weak")}"><b>Weak</b></a>`)

    const regexp = /\(\(\#(.*?)\)\)/g;
    const mathMatches = [...description.matchAll(regexp)];
    mathMatches.forEach(match => {
      description = description.replace(match[0], window.math.evaluate(match[1]))
    })
    
    return description;
  }

  /**
   * Prepare a data object which is passed to any Roll formulas which are created related to this Item
   * @private
   */
   getRollData() {
    // If present, return the actor's roll data.
    if ( !this.actor ) return null;
    const rollData = this.actor.getRollData();
    rollData.item = foundry.utils.deepClone(this.data.data);

    console.log(rollData)
    return rollData;
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll() {
    const item = this.data;

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    const label = `[${item.type}] ${item.name}`;

    // If there's no roll data, send a chat message.
    if (item.type !== "power") {
      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
        content: item.data.descriptionDisplay ?? ''
      });
    }
    // Otherwise, create a roll and send a chat message from it.
    else {
      this.actor.sheet._onPowerRoll(null, item)
    }
  }
}
