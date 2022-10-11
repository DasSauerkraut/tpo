/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class tpoItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData();
    this.data.data.description = TextEditor.enrichHTML(this.data.data.description);
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

  /**
   * Prepare a data object which is passed to any Roll formulas which are created related to this Item
   * @private
   */
   getRollData() {
    // If present, return the actor's roll data.
    if ( !this.actor ) return null;
    const rollData = this.actor.getRollData();
    rollData.item = foundry.utils.deepClone(this.data.data);

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
