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
    return `${path}/item-${this.item.data.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve base data structure.
    const context = super.getData();

    // Use a safe clone of the item data for further operations.
    const itemData = context.item.data;

    // Retrieve the roll data for TinyMCE editors.
    context.rollData = {};
    let actor = this.object?.parent ?? null;
    if (actor) {
      context.rollData = actor.getRollData();
    }

    // Add the actor's data to context.data for easier access, as well as flags.
    context.data = itemData.data;
    context.flags = itemData.flags;

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
    this.object.update({[`data.advanced`]: !this.object.data.data.advanced })
  }

  _onGroupedToggle(event){
    this.object.update({[`data.grouped`]: !this.object.data.data.grouped })
  }

  _onWeakToggle(event){
    this.object.update({[`data.isWeak`]: !this.object.data.data.isWeak })
  }

  _onStackableToggle(event){
    this.object.update({[`data.stack.stackable`]: !this.object.data.data.stack.stackable })
  }

  async _onElementToggle(event, element){
    await this.object.update({[`data.selectedElement.${element}`]: !this.object.data.data.selectedElement[element] });
    let displayStr = ""
    if(this.object.data.data.selectedElement.fire)
      displayStr+="Fire "
    if(this.object.data.data.selectedElement.elec)
      displayStr+="Elec. "
    if(this.object.data.data.selectedElement.dragon)
      displayStr+="Dragon "
    if(this.object.data.data.selectedElement.ice)
      displayStr+="Ice "
    if(this.object.data.data.selectedElement.water)
      displayStr+="Water "
    this.object.update({[`data.selectedElement.display`]: displayStr });
  }
}
