
/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class tpoItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["tpo", "sheet", "item"],
      width: 580,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }],
      scrollY: [".tab-scroll"],
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

    html.find('.add-macro').click(this._onMacroAdd.bind(this));
    html.find('.macro-delete').click(this._onMacroDelete.bind(this));
    html.find('.macro-script').focusout(this._onMacroFocusOut.bind(this));
    html.find('.macro-select').change(this._onMacroChange.bind(this));

    html.find('#isSuspended-toggle').click(this._onIsSuspendedToggle.bind(this));
    html.find('.add-effect').click(this._onChangeAdd.bind(this));
    html.find('.delete-effect').click(this._onChangeDelete.bind(this));
    html.find('.change-mode').change(this._onChangeSelect.bind(this));
    html.find('.change-key').focusout(this._onChangeInput.bind(this));
    html.find('.change-value').focusout(this._onChangeInput.bind(this));

    $("input[type=text]").focusin(function() {
      $(this).select();
    });
  }
  _onMacroChange(event) {
    event.preventDefault();
    let index = $(event.target).parents(".resource").data("macro-id");
    const macros = this.object.system.macros;
    if($(event.target).hasClass("trigger"))
      macros[index].trigger = event.target.value;
    else
      macros[index].type = event.target.value;

    this.object.update({[`system.macros`]: macros})
  }

  _onMacroFocusOut(event) {
    event.preventDefault();
    let index = $(event.target).parents(".resource").data("macro-id");
    const macros = this.object.system.macros;
    macros[index].script = event.target.value;
    this.object.update({[`system.macros`]: macros})
  }

  _onMacroDelete(event) {
    event.preventDefault();
    const macroIndex = $(event.target).parents(".macro-delete").data("macro-id")
    const macros = this.object.system.macros;
    macros.splice(macroIndex, 1);
    this.object.update({[`system.macros`]: macros})
  }

  _onMacroAdd(event) {
    let newMacros;
    const newMacro = {
      "type": "script",
      "trigger": "",
      "script": ""
    }
    if(this.object.system.macros?.length > 0)
      newMacros = [...this.object.system.macros, newMacro]
    else
      newMacros = [newMacro]
    this.object.update({[`system.macros`]: newMacros})
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
      displayStr+='<i class="fas fa-fire" data-tooltip="Fire"></i> ' 
    if(this.object.system.selectedElement.elec)
      displayStr+='<i class="fas fa-bolt" data-tooltip="Electricity"></i> '
    if(this.object.system.selectedElement.dragon)
      displayStr+= '<i class="fas fa-dragon" data-tooltip="Dragon"></i> '
    if(this.object.system.selectedElement.ice)
      displayStr+='<i class="fas fa-snowflake" data-tooltip="Ice"></i> '
    if(this.object.system.selectedElement.water)
      displayStr+='<i class="fas fa-tint" data-tooltip="Water"></i> '
    await this.object.update({[`system.selectedElement.display`]: displayStr });
  }

  _onIsSuspendedToggle(event){
    this.object.update({[`system.isSuspended`]: !this.object.system.isSuspended })
  }

  _onChangeAdd(event) {
    let newChanges;
    const newChange = {
      "key": "",
      "mode": "2",
      "value": ""
    }
    if(this.object.system.changes?.length > 0)
      newChanges = [...this.object.system.changes, newChange]
    else
      newChanges = [newChange]
    this.object.update({[`system.changes`]: newChanges})
  }

  _onChangeDelete(event) {
    event.preventDefault();
    const changeIndex = $(event.target).parents(".delete-effect").data("change-id")
    const changes = this.object.system.changes;
    changes.splice(changeIndex, 1);
    this.object.update({[`system.changes`]: changes})
  }

  _onChangeSelect(event) {
    event.preventDefault();
    console.log('chengin')
    let index = $(event.target).parents(".effect-change").data("index");
    const changes = this.object.system.changes;
    changes[index].mode = event.target.value

    this.object.update({[`system.changes`]: changes})
  }

  _onChangeInput(event) {
    event.preventDefault();
    let index = $(event.target).parents(".effect-change").data("index");
    const changes = this.object.system.changes;
    if($(event.target).hasClass("change-key"))
      changes[index].key = event.target.value;
    else if($(event.target).hasClass("change-value"))
      changes[index].value = event.target.value;
    else return;

    this.object.update({[`system.changes`]: changes})
  }
}
