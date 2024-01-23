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
    const actor = this.actor
    this.system.descriptionDisplay = this.formatDescription(this.system.description)
    if(this.system.value && (this.type === "item" || this.type === "armament"))
        this.system.value.total = (this.system.value.l + this.system.value.s/20 + this.system.value.c/200).toFixed(2)
    
    if(this.type === "armament"){
      let displayStr = ""
      if(this.system.selectedElement.fire)
        displayStr+='<i class="fas fa-fire" data-tooltip="Fire"></i> ' 
      if(this.system.selectedElement.elec)
        displayStr+='<i class="fas fa-bolt" data-tooltip="Electricity"></i> '
      if(this.system.selectedElement.dragon)
        displayStr+= '<i class="fas fa-dragon" data-tooltip="Dragon"></i> '
      if(this.system.selectedElement.ice)
        displayStr+='<i class="fas fa-snowflake" data-tooltip="Ice"></i> '
      if(this.system.selectedElement.water)
        displayStr+='<i class="fas fa-tint" data-tooltip="Water"></i> '
      this.system.selectedElement.display = displayStr;

      this.system.damage.value = this.system.damage.base + this.system.damage.upgrades;
      this.system.elementDamage.value = this.system.elementDamage.base + this.system.elementDamage.upgrades;

      if(this.system.powers.length !== 0){
        this.system.powers = this.system.powers.filter((pwr) => {
          return actor.items.get(pwr._id)
        })
        var sort = {"At-Will": 1, "Daily": 2, "Adventure": 3}
        this.system.powers.sort((a, b) => {
          return sort[a.type] - sort[b.type];
        })
      }
    }
    if(this.type === "ability"){
      this.system.value = this.system.improvements + this.system.mod - this.system.malus;
      this.system.level = Math.floor(this.system.value / 20)
    }
    if(this.type === "power"){
      if(this.system.attacks === undefined)
        this.system.attacks = 1;
      if(this.system.type === "Encounter")
        this.system.type = 'Daily'
        if(this.system.type === "Weekly")
        this.system.type = 'Adventure'

      let displayStr = ""
      if(this.system.selectedElement.fire)
        displayStr+='<i class="fas fa-fire" data-tooltip="Fire"></i> ' 
      if(this.system.selectedElement.elec)
        displayStr+='<i class="fas fa-bolt" data-tooltip="Electricity"></i> '
      if(this.system.selectedElement.dragon)
        displayStr+= '<i class="fas fa-dragon" data-tooltip="Dragon"></i> '
      if(this.system.selectedElement.ice)
        displayStr+='<i class="fas fa-snowflake" data-tooltip="Ice"></i> '
      if(this.system.selectedElement.water)
        displayStr+='<i class="fas fa-tint" data-tooltip="Water"></i> '
      this.system.selectedElement.display = displayStr;
    }
    if(this.type === "skill" && actor?.system){
      const stat = actor.system.stats[this.system.stat].initial + actor.system.stats[this.system.stat].improvements + actor.system.stats[this.system.stat].modifier
      this.system.total = stat + this.system.improvements;
    }
    if(this.type === "zone"){
      let display = "";
      if(this.system.elementalResistances.fire === "W")
        display += '<i class="fas fa-fire" data-tooltip="Weak to Fire" style="color: #642422; text-shadow: 0 0 4px #ff0800;"></i> '
      else if(this.system.elementalResistances.fire === "S")
        display += '<i class="fas fa-fire" data-tooltip="Resists Fire" style="color: var(--color-border-light-primary);"></i> '
      else
        display += '<i class="fas fa-fire" data-tooltip="Fire"></i> '

      if(this.system.elementalResistances.elec === "W")
        display += '<i class="fas fa-bolt" data-tooltip="Weak to Electricity" style="color: #642422; text-shadow: 0 0 4px #ff0800;"></i> '
      else if(this.system.elementalResistances.elec === "S")
        display += '<i class="fas fa-bolt" data-tooltip="Resists Electricity" style="color: var(--color-border-light-primary);"></i> '
      else
        display += '<i class="fas fa-bolt" data-tooltip="Electricity"></i> '

      if(this.system.elementalResistances.dragon === "W")
        display += '<i class="fas fa-dragon" data-tooltip="Weak to Dragon" style="color: #642422; text-shadow: 0 0 4px #ff0800;"></i> '
      else if(this.system.elementalResistances.dragon === "S")
        display += '<i class="fas fa-dragon" data-tooltip="Resists Dragon" style="color: var(--color-border-light-primary);"></i> '
      else
        display += '<i class="fas fa-dragon" data-tooltip="Dragon"></i> '

      if(this.system.elementalResistances.ice === "W")
        display += '<i class="fas fa-snowflake" data-tooltip="Weak to Ice" style="color: #642422; text-shadow: 0 0 4px #ff0800;"></i> '
      else if(this.system.elementalResistances.ice === "S")
        display += '<i class="fas fa-snowflake" data-tooltip="Resists Ice" style="color: var(--color-border-light-primary);"></i> '
      else
        display += '<i class="fas fa-snowflake" data-tooltip="Ice"></i> '

      if(this.system.elementalResistances.water === "W")
        display += '<i class="fas fa-tint" data-tooltip="Weak to Water" style="color: #642422; text-shadow: 0 0 4px #ff0800;"></i> '
      else if(this.system.elementalResistances.water === "S")
        display += '<i class="fas fa-tint" data-tooltip="Resists Water" style="color: var(--color-border-light-primary);"></i> '
      else
        display += '<i class="fas fa-tint" data-tooltip="Water"></i> '

      this.system.elementalResistances.display = display
    }
  }

  formatDescription(description){
    if(!this.actor || !this.actor.system || !description)
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
    // Mobile
    description = description.replaceAll("Mobile", `<a class='rollable' title="${game.i18n.format("KEYWORD.Mobile")}"><b>Mobile</b></a>`)

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
    description = description.replaceAll("Weak", `<a class='rollable' title="${game.i18n.format("KEYWORD.Weak").replaceAll("NUM", this.actor.system.stats.str.bonus)}"><b>Weak</b></a>`)

    const rechargeRegExp = /(Recharge )(\d+)/g
    const rechargeMatches = [...description.matchAll(rechargeRegExp)]
    rechargeMatches.forEach(match => {
      description = description.replace(match[0], `<a class='rollable' title="${game.i18n.format("KEYWORD.Recharge").replaceAll("NUM", match[2])}"><b>Recharge ${match[2]}</b></a>`)
    })

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
    rollData.item = foundry.utils.deepClone(this.system);

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
