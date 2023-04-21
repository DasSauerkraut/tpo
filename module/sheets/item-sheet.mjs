/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class tpoItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["tpo", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/tpo/templates/item";
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.html`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.html`.
    return `${path}/item-${this.item.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve base data structure.
    const context = super.getData();

    // Use a safe clone of the item data for further operations.
    const itemData = context.item;

    // Retrieve the roll data for TinyMCE editors.
    context.rollData = {};
    let actor = this.object?.parent ?? null;
    if (actor) {
      context.rollData = actor.getRollData();
    }

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = itemData;
    context.flags = itemData.flags;
    console.log(context)
    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Roll handlers, click handlers, etc. would go here.
    html.find('#advanced-toggle').click(this._onAdvancedToggle.bind(this));
    html.find('#grouped-toggle').click(this._onGroupedToggle.bind(this));

    html.find('#fire').click(event => {this._onElementToggle(event, "fire")});
    html.find('#electricity').click(event => {this._onElementToggle(event, "elec")});
    html.find('#dragon').click(event => {this._onElementToggle(event, "dragon")});
    html.find('#ice').click(event => {this._onElementToggle(event, "ice")});
    html.find('#water').click(event => {this._onElementToggle(event, "water")});

    html.find('#weak-toggle').click(event => {this._onWeakToggle(event)});

    html.find('#stackable').click(event => {this._onStackableToggle(event)});

    $("input[type=text]").focusin(function() {
      $(this).select();
    });
  }

  _onAdvancedToggle(event){
    this.object.update({[`system.advanced`]: !this.object.system.advanced })
  }

  _onGroupedToggle(event){
    this.object.update({[`system.grouped`]: !this.object.system.grouped })
  }

  _onWeakToggle(event){
    this.object.update({[`system.isWeak`]: !this.object.system.isWeak })
  }

  _onStackableToggle(event){
    this.object.update({[`system.stack.stackable`]: !this.object.system.stack.stackable })
  }

  async _onElementToggle(event, element){
    await this.object.update({[`system.selectedElement.${element}`]: !this.object.system.selectedElement[element] });
    let displayStr = ""
    if(this.object.system.selectedElement.fire)
      displayStr+="Fire "
    if(this.object.system.selectedElement.elec)
      displayStr+="Elec. "
    if(this.object.system.selectedElement.dragon)
      displayStr+="Dragon "
    if(this.object.system.selectedElement.ice)
      displayStr+="Ice "
    if(this.object.system.selectedElement.water)
      displayStr+="Water "
    this.object.update({[`system.selectedElement.display`]: displayStr });
  }
}
