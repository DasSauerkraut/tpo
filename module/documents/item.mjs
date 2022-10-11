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
  }

  formatDescription(description){
    if(!this.actor || !this.actor.data || !description)
      return;
    console.log(this.actor.data.data)
    //ws
    description = description.replace("((@ws))", `<span title="WS">${this.actor.getStatData("ws")}</span>`)
    description = description.replace("((@wsb))", `<span title="WSB">${this.actor.getStatData("ws", true)}</span>`)
    //str
    description = description.replace("((@str))", `<span title="Str">${this.actor.getStatData("str")}</span>`)
    description = description.replace("((@strb))", `<span title="StrB">${this.actor.getStatData("str", true)}</span>`)
    //con
    description = description.replace("((@con))", `<span title="Con">${this.actor.getStatData("con")}</span>`)
    description = description.replace("((@conb))", `<span title="ConB">${this.actor.getStatData("con", true)}</span>`)
    //agi
    description = description.replace("((@agi))", `<span title="Agi">${this.actor.getStatData("agi")}</span>`)
    description = description.replace("((@agib))", `<span title="AgiB">${this.actor.getStatData("agi", true)}</span>`)
    //dex
    description = description.replace("((@dex))", `<span title="Dex">${this.actor.getStatData("dex")}</span>`)
    description = description.replace("((@dexb))", `<span title="DexB">${this.actor.getStatData("dex", true)}</span>`)
    //int
    description = description.replace("((@int))", `<span title="Int">${this.actor.getStatData("int")}</span>`)
    description = description.replace("((@intb))", `<span title="IntB">${this.actor.getStatData("int", true)}</span>`)
    //will
    description = description.replace("((@will))", `<span title="Will">${this.actor.getStatData("will")}</span>`)
    description = description.replace("((@willb))", `<span title="WillB">${this.actor.getStatData("will", true)}</span>`)
    //cha
    description = description.replace("((@cha))", `<span title="Cha">${this.actor.getStatData("cha")}</span>`)
    description = description.replace("((@chab))", `<span title="ChaB">${this.actor.getStatData("cha", true)}</span>`)
    return description;
  }

  /**
   * Prepare a data object which is passed to any Roll formulas which are created related to this Item
   * @private
   */
   async getRollData() {
    // If present, return the actor's roll data.
    if ( !this.actor ) return null;
    const rollData = await this.actor.getRollData();
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
    if (!this.data.data.formula) {
      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
        content: item.data.description ?? ''
      });
    }
    // Otherwise, create a roll and send a chat message from it.
    else {
      // Retrieve roll data.
      const rollData = this.getRollData();

      // Invoke the roll and submit it to chat.
      const roll = new Roll(rollData.item.formula, rollData);
      // If you need to store the value first, uncomment the next line.
      // let result = await roll.roll({async: true});
      roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
      });
      return roll;
    }
  }
}
