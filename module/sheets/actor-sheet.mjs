import {onManageActiveEffect, prepareActiveEffectCategories} from "../helpers/effects.mjs";
import { DiceTPO, UtilsTPO } from "../helpers/utilities.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class tpoActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["tpo", "sheet", "actor"],
      template: "systems/tpo/templates/actor/actor-sheet.html",
      width: 650,
      height: 710,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "features" }]
    });
  }

  /** @override */
  get template() {
    return `systems/tpo/templates/actor/actor-${this.actor.data.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.data.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.data = actorData.data;
    context.flags = actorData.flags;

    // Prepare character data and items.
    if (actorData.type == 'character') {
      // this._prepareItems(context);
      this._prepareCharacterData(context);
    }


    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(this.actor.effects);

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item-container");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    html.find('.ability-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".expand-container");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    //Save skill changes
    html.find('.skill-item-input').focusout(this._onSkillFocusOut.bind(this));
    html.find('.abilities-imp').focusout(this._onAbilityFocusOut.bind(this));
    html.find('.abilities-mod').focusout(this._onAbilityFocusOut.bind(this));
    html.find('.abilities-malus').focusout(this._onAbilityFocusOut.bind(this));

    //Improve skill
    html.find('.skill-item-total').mousedown(this._onSkillImprove.bind(this));
    //Improve Ability
    html.find('.ability-imp-btn').mousedown(this._onAbilityImprove.bind(this));

    //Edit skill/Roll Skill
    html.find('.skill-item-name').mousedown(this._onSkillClick.bind(this));
    //Edit Ability
    html.find('.ability-name').mousedown(event => {
      if(event.button !== 0){
        this.actor.items.get(event.currentTarget.getAttribute("data-item-id")).sheet.render(true);
      }
    });

    // Active Effect management
    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

    html.find('.stat-header').click(this._onStatRoll.bind(this))
    html.find('.stat-total').mousedown(this._onStatImprove.bind(this))

    html.find('.resolve').click(this._onResolveToggle.bind(this));

    html.find('.expand-controller').click(this._onArmamentExpand.bind(this));
    html.find('.expand-controller-nested').click(this._onArmamentExpandNested.bind(this));

    html.find('#hp-max').click(event => {
      event.preventDefault();
      this.actor.update({[`data.autocalc.hp`]: !this.actor.data.data.autocalc.hp })
    })

    html.find('#hp-heal').click(this._onRest.bind(this));

    html.find('#ap-max').click(event => {
      event.preventDefault();
      this.actor.update({[`data.autocalc.ap`]: !this.actor.data.data.autocalc.ap })
    })

    html.find('#thp-max').click(event => {
      event.preventDefault();
      this.actor.update({[`data.autocalc.thp`]: !this.actor.data.data.autocalc.thp })
    })

    html.find('#bloodied').click(event => {
      event.preventDefault();
      this.actor.update({[`data.autocalc.bloodied`]: !this.actor.data.data.autocalc.bloodied })
    })

    html.find('#movement').click(event => {
      event.preventDefault();
      this.actor.update({[`data.autocalc.movement`]: !this.actor.data.data.autocalc.movement })
    })

    html.find('#absorption').click(event => {
      event.preventDefault();
      this.actor.update({[`data.autocalc.absorption`]: !this.actor.data.data.autocalc.absorption })
    })

    html.find('.powerDelete').click(this._onPowerDelete.bind(this))
    html.find('.powerRoll').click(this._onPowerRoll.bind(this))
    html.find('.power-draggable').mousedown(this._onPowerOrArmamentEdit.bind(this))
    html.find('.armament-name').mousedown(this._onPowerOrArmamentEdit.bind(this))

    html.find('.action').click(this._onCombatAction.bind(this))

    html.find('.upgradeDelete').click(ev => {
      const li = $(ev.currentTarget).parents(".expand-container-nested");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    html.find('.power-used').click(this._onPowerCheck.bind(this));

    //select whole input field on click
    $("input[type=text]").focusin(function() {
      $(this).select();
    });

    html.find('.itemDelete').click(this._onItemDelete.bind(this))
    html.find('.inventory-item').each((i, li) => {
      li.setAttribute("draggable", true);
      li.addEventListener("dragstart", (ev) => {this._onDragItemStart(ev)}, false);
    });
    html.on("dragenter", ".inventory-section", ev => {
      ev.target.classList.add("dragover")
    })
    html.on("dragleave", ".inventory-section", ev => {
      ev.target.classList.remove("dragover")
    })
    html.on("drop", ".inventory-section", ev => {
      ev.target.classList.remove("dragover")
      this._onItemDrop(ev, JSON.parse(ev.originalEvent.dataTransfer.getData("text/plain")).data)
    })
    html.find('.inventory-item').mousedown(this._onPowerOrArmamentEdit.bind(this))
    html.find('.containerDelete').click(this._onContainerDelete.bind(this))

    // Drag events for macros.
    let handler = ev => this._onDragItemStart.bind(this);
    html.find('.power-draggable').each((i, li) => {
      li.setAttribute("draggable", true);
      li.addEventListener("dragstart", (ev) => {this._onDragItemStart(ev)}, false);
    });
    html.on("dragenter", ".armament-container", ev => {
      ev.target.classList.add("dragover")
    })
    html.on("dragleave", ".armament-container", ev => {
      ev.target.classList.remove("dragover")
    })
    html.on("drop", ".armament-container", ev => {
      ev.target.classList.remove("dragover")
      this._onArmamentDrop(ev, JSON.parse(ev.originalEvent.dataTransfer.getData("text/plain")).data)
    })

    html.on("dragenter", ".unequipped-powers", ev => {
      $(".unequipped-powers").addClass("dragover");
    })
    html.on("dragleave", ".unequipped-powers", ev => {
      $(".unequipped-powers").removeClass("dragover");
    })
    html.on("drop", ".unequipped-powers", ev => {
      $(".unequipped-powers").removeClass("dragover");
      this._onPowerUnequip(ev, JSON.parse(ev.originalEvent.dataTransfer.getData("text/plain")).data)
    })
  }

  _onPowerOrArmamentEdit(event) {
    if(event.button !== 0){
      this.actor.items.get(event.currentTarget.getAttribute("data-item-id")).sheet.render(true);
    }
  }

  _onDragItemStart(ev) {
    let itemId = ev.currentTarget.getAttribute("data-item-id");
    if (!itemId)
      return
    const item = this.actor.items.get(itemId).toObject()
    ev.dataTransfer.setData("text/plain", JSON.stringify({
      type: "Item",
      sheetTab: this.actor.data.flags["_sheetTab"],
      actorId: this.actor.id,
      data: item,
      root: ev.currentTarget.getAttribute("root")
    }));
  }

  _onRest(event){
    let skill;
    let testData = {
      advantage: 0,
      disadvantage: 0,
      modifier: 0,
      risk: false,
      difficulty: 0,
    };

    let selectedHeal;
    let healOptions = ["No Supplies", "Poor Supplies", "Common Supplies", "Fine Supplies", "Safe Location"]
    let callback = (html) => {
      selectedHeal = html.find('[name="heal"]').val();
    }
    renderTemplate('systems/tpo/templates/dialog/combatActionPicker.html', healOptions).then(dlg => {
      new Dialog({
        title: game.i18n.localize("SYS.Rest"),
        content: dlg,
        buttons: {
          rollButton: {
            label: game.i18n.localize("SYS.Rest"),
            callback: html => {
              callback(html);
              skill = this.actor.items.getName(selectedHeal);

              if(skill === undefined){
                skill = {
                  name: "Weapon Skill",
                  data: {
                    data: {
                      total: this.actor.data.data.stats.ws.value
                    },
                  }
                }
              }
              this._performTest(skill, testData, 0, 0, `Defending w/ ${selectedSkill}`);;
            }
          },
        },
        default: "rollButton"
      }).render(true);
    });
  }

  async _onCombatAction(event) {
    event.preventDefault();
    const action = $(event.currentTarget).data("action")
    let skill;
    let testData = {
      advantage: 0,
      disadvantage: 0,
      modifier: 0,
      risk: false,
      difficulty: 0,
    };

    let selectedSkill;
    let skillOptions = [];
    let callback = (html) => {
      selectedSkill = html.find('[name="skill"]').val();
      return selectedSkill;
    }

    switch (action) {
      case "defend":
        if(this.actor.items.getName("Dodge"))
          skillOptions.push("Dodge")
        if(this.actor.items.getName("Weapon (Heavy)"))
          skillOptions.push("Weapon (Heavy)")
        if(this.actor.items.getName("Weapon (Light)"))
          skillOptions.push("Weapon (Light)")
        if(this.actor.items.getName("Weapon (Ranged)"))
          skillOptions.push("Weapon (Ranged)")
        if(this.actor.items.getName("Weapon (Mundane)"))
          skillOptions.push("Weapon (Mundane)")
        
        skillOptions.push("Weapon Skill")

        if(1 > this.actor.data.data.derived.ap.value)
          ui.notifications.error(game.i18n.format('SYS.ExceedsAP'));
        this.actor.update({[`data.derived.ap.value`]: this.actor.data.data.derived.ap.value - 1 })

        renderTemplate('systems/tpo/templates/dialog/combatActionPicker.html', skillOptions).then(dlg => {
          new Dialog({
            title: game.i18n.localize("SYS.Defend"),
            content: dlg,
            buttons: {
              rollButton: {
                label: game.i18n.localize("SYS.Defend"),
                callback: html => {
                  callback(html);
                  skill = this.actor.items.getName(selectedSkill);

                  if(skill === undefined){
                    skill = {
                      name: "Weapon Skill",
                      data: {
                        data: {
                          total: this.actor.data.data.stats.ws.value
                        },
                      }
                    }
                  }
                  this._performTest(skill, testData, 0, 0, `Defending w/ ${selectedSkill}`);;
                }
              },
            },
            default: "rollButton"
          }).render(true);
        });
        break;
      case "disengage":
        skill = this.actor.items.getName("Dodge");

        if(skill === undefined){
          skill = {
            name: "Agility",
            data: {
              data: {
                total: this.actor.data.data.stats.agi.value
              },
            }
          }
          testData.disadvantage = 1;
        }
        if(1 > this.actor.data.data.derived.ap.value)
          ui.notifications.error(game.i18n.format('SYS.ExceedsAP'));
        this.actor.update({[`data.derived.ap.value`]: this.actor.data.data.derived.ap.value - 1 })

        this._performTest(skill, testData, 0, 0, "Disengaging");
        break;
      case "morale":
        skill = this.actor.items.getName("Cool");
        testData.difficulty = 20;

        if((this.actor.data.data.details.species.value === game.i18n.format("SPECIES.Narvid")) && 
        (this.actor.data.data.derived.hp.value <= this.actor.data.data.derived.bloodied.value)){
          testData.disadvantage += 1;
        }

        if(skill === undefined){
          skill = {
            name: "Willpower",
            data: {
              data: {
                total: this.actor.data.data.stats.will.value
              },
            }
          }
          testData.disadvantage += 1;
        }
        this._performTest(skill, testData, 0, 0, "Morale Test");
        break;
      case "grapple":
        skill = this.actor.items.getName("Grapple");

        if(2 > this.actor.data.data.derived.ap.value)
          ui.notifications.error(game.i18n.format('SYS.ExceedsAP'));
        this.actor.update({[`data.derived.ap.value`]: this.actor.data.data.derived.ap.value - 2 })

        if(skill === undefined){
          skill = {
            name: "Strength",
            data: {
              data: {
                total: this.actor.data.data.stats.str.value
              },
            }
          }
          testData.disadvantage = 1;
        }
        this._performTest(skill, testData, 0, 0, "Grappling");
        break;
      case "mounted":
        selectedSkill;
        skillOptions = [];
        if(this.actor.items.getName("Ride (Ceffyl)"))
          skillOptions.push("Ride (Ceffyl)")
        if(this.actor.items.getName("Ride (Draft)"))
          skillOptions.push("Ride (Draft)")
        if(this.actor.items.getName("Ride (Radacen)"))
          skillOptions.push("Ride (Radacen)")
        if(this.actor.items.getName("Animal Handling"))
          skillOptions.push("Animal Handling")
        skillOptions.push("Willpower")

        renderTemplate('systems/tpo/templates/dialog/combatActionPicker.html', skillOptions).then(dlg => {
          new Dialog({
            title: game.i18n.localize("SYS.MountAction"),
            content: dlg,
            buttons: {
              rollButton: {
                label: game.i18n.localize("SYS.MountAction"),
                callback: html => {
                  callback(html);
                  skill = this.actor.items.getName(selectedSkill);

                  if(skill === undefined){
                    skill = {
                      name: "Weapon Skill",
                      data: {
                        data: {
                          total: this.actor.data.data.stats.ws.value
                        },
                      }
                    }
                  }
                  this._performTest(skill, testData, 0, 0, `Defending w/ ${selectedSkill}`);;
                }
              },
            },
            default: "rollButton"
          }).render(true);
        });
        break;
      default:
        break;
    }
  }

  async _onPowerCheck(event){
    const li = $(event.currentTarget).parents(".expand-container-nested");
    const item = duplicate(this.actor.items.get(li.data("itemId")));
    const armament = duplicate(this.actor.items.get(item.data.parent.id));

    item.data.used = !item.data.used;

    await this.actor.updateEmbeddedDocuments("Item", [item]);
    await UtilsTPO.updateStoredPower(armament, item, this.actor);
  }

  async _usePower(powerId, armamentId){
    const item = duplicate(this.actor.items.get(powerId));
    const armament = duplicate(this.actor.items.get(armamentId));

    item.data.used = !item.data.used;

    await this.actor.updateEmbeddedDocuments("Item", [item]);
    await UtilsTPO.updateStoredPower(armament, item, this.actor);
  }

  async _onItemDrop(event, item){
    event.preventDefault();

    //Trying to get location from header data rn
    let location;

    if($(event.target).hasClass("inventory-section")){
      location = $(event.target).data("location");
    } else {
      const itemHeader = $(event.target).parents(".inventory-section");
      location = itemHeader.data("location");
    }
    console.log(location);
    console.log(this.actor.data.data.inventory[location]);

    if (this.actor.data.data.inventory[location].some(itm => itm._id === item._id)) {
      console.log('Contains dupe, bailing out');
      return;
    }

    item.data.location = location;

    await this.actor.updateEmbeddedDocuments("Item", [item]);
  }

  async _onArmamentDrop(event, item){
    event.preventDefault();
    if(item.type === "power"){
      const armamentDiv = $(event.target).parents(".armament-container");
      const armament = duplicate(this.actor.items.get(armamentDiv.data("itemId")));

      if (armament.data.powers.some(power => power._id === item._id)) {
        console.log('Contains dupe, bailing out');
        return;
      }

      item.data.parent.hasParent = true;
      item.data.parent.id = armament._id;
      
      if(item.data.type === "Misc"){
        armament.data.miscPowers.push(item);
        armament.data.capacity.currentMisc = armament.data.powers.length;
      } else if(item.data.type === "Upgrade"){
        armament.data.upgrades.push(item);
      } else {
        armament.data.powers.push(item);
        armament.data.capacity.currentPowers = armament.data.powers.length;
      }
      
      await this.actor.updateEmbeddedDocuments("Item", [item]);
      await this.actor.updateEmbeddedDocuments("Item", [armament]);
    }
  }

  async _onPowerUnequip(event, item){
    event.preventDefault();
    if(item.type === "power"){
      if (this.actor.data.data.unsortedPowers.some(power => power._id === item._id)) {
        console.log('Contains dupe, bailing out');
        return;
      }

      const armament = duplicate(this.actor.items.get(item.data.parent.id));

      if(item.data.type === "Misc"){
        armament.data.miscPowers = armament.data.miscPowers.filter(( pwr ) => {
          return pwr._id !== item._id;
        });
      } else if(item.data.type === "Upgrade"){
        armament.data.upgrades = armament.data.upgrades.filter(( pwr ) => {
          return pwr._id !== item._id;
        });
      } else {
        armament.data.powers = armament.data.powers.filter(( pwr ) => {
          return pwr._id !== item._id;
        });
      }

      item.data.parent.hasParent = false;
      item.data.parent.id = null;

      armament.data.capacity.currentPowers = armament.data.powers.length;
      armament.data.capacity.misc === 0 && armament.data.miscPowers.length === 0 ? armament.data.capacity.hasMisc = false : armament.data.capacity.hasMisc = true;
      armament.data.capacity.currentMisc = armament.data.miscPowers.length;

      await this.actor.updateEmbeddedDocuments("Item", [item]);
      await this.actor.updateEmbeddedDocuments("Item", [armament]);
    }
  }

  _onPowerDelete(event){
    event.preventDefault();
    const container = $(event.target).parents(".subheader");
    const power = this.actor.items.get(container.data("power-id"));
    power.delete();
  }

  _onItemDelete(event){
    event.preventDefault();
    const container = $(event.target).parents(".expandable");
    const item = this.actor.items.get(container.data("id"));
    item.delete();
  }

  async _onContainerDelete(event){
    event.preventDefault();
    const container = $(event.target).parents(".inventory-section:first");
    const location = container.data("location")
    const chestLoc = duplicate(this.actor.data.data.inventory.chest);

    console.log(chestLoc)
    await this.actor.update({[`data.inventory.chest`]: chestLoc })
    await this.actor.update({[`data.inventory.${location}`]: [] })

    console.log(this.actor.data.data.inventory.chest)
    console.log(this.actor.data.data.inventory[location])

    const item = this.actor.items.getName(location);
    console.log(item);
    item.delete();
  }

  _onStatRoll(event){
    event.preventDefault();
    const stat = event.currentTarget.getAttribute("data-stat");

    let testData = {
      advantage: 0,
      disadvantage: 0,
      modifier: 0,
      risk: false,
      difficulty: 20,
      hasDamage: false
    }
    
    const statOut = {
        name: game.i18n.localize(this.actor.data.data.stats[stat].label),
        data: {
          data: {
            total: this.actor.data.data.stats[stat].value
          },
        }
      }
      
    this._performTest(statOut, testData);
  }

  _onPowerRoll(event){
    event.preventDefault();
    const container = $(event.target).parents(".subheader");
    const power = this.actor.items.get(container.data("power-id")).data;
    const armament = this.actor.items.get(power.data.parent.id).data;
    
    if(power.data.type === "Encounter" || power.data.type === "Weekly"){
      if(power.data.used)
        ui.notifications.info(game.i18n.format('SYS.PowerUsed'));
      else 
        this._usePower(power._id, armament._id);
    }

    if(power.data.apCost > this.actor.data.data.derived.ap.value)
      ui.notifications.error(game.i18n.format('SYS.ExceedsAP'));
    this.actor.update({[`data.derived.ap.value`]: this.actor.data.data.derived.ap.value - power.data.apCost })

    let skill = this.actor.items.getName(`Weapon (${armament.data.skill})`);

    let testData = {
      advantage: 0,
      disadvantage: 0,
      modifier: 0,
      risk: false,
      difficulty: 0,
      hasDamage: true,
      damage: power.data.damageMod,
      element: armament.data.selectedElement.display,
      elementDamage: power.data.elementDamageMod
    }

    if(skill === undefined){
      skill = {
        name: "Weapon Skill",
        data: {
          data: {
            total: this.actor.data.data.stats.ws.value
          },
        }
      }
      testData.disadvantage = 1;
    }

    this._performTest(skill, testData, armament.data.damage.value, armament.data.elementDamage.value, power.name);
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    return await Item.create(itemData, {parent: this.actor});
  }

  /**
   * Handle calculating stat improvement costs and xp spend.
   * @param {Event} event   The originating click event
   * @private
   */
  _onStatImprove(event) {
    const element = event.currentTarget;
    const dataset = element.dataset;

    const IMPROVEMENT_CAP = 20;

    const improvements = this.actor.data.data.stats[dataset.improve].improvements;
    const xpSpent = this.actor.data.data.info.xp.spent;

    if(event.button === 0){
      const cost = 4 + Math.floor(improvements / 5) * 2;

      if(improvements >= IMPROVEMENT_CAP){
        ui.notifications.error(game.i18n.format("ERROR.StatImpCap"));
        return;
      }
      if((this.actor.data.data.info.xp.earned - (this.actor.data.data.info.xp.spent + cost)) < 0 ) {
        ui.notifications.error(game.i18n.format("ERROR.StatNoXp"));
        return;
      }
      
      this.actor.update({[`data.stats.${dataset.improve}.improvements`]: improvements + 1 })
      this.actor.update({[`data.info.xp.spent`]: cost + xpSpent })

    } else {
      const cost = 4 + Math.floor((improvements - 1) / 5) * 2;

      if(improvements <= 0){
        ui.notifications.error(game.i18n.format("ERROR.StatLessThanZero"));
        return;
      }

      this.actor.update({[`data.stats.${dataset.improve}.improvements`]: improvements - 1 })
      this.actor.update({[`data.info.xp.spent`]: xpSpent - cost })
    }
  }

  /**
   * Handle manually improving a stat.
   * @param {Event} event   The originating click event
   * @private
   */
  async _onSkillFocusOut(event) {
    event.preventDefault();

    let itemId = event.target.attributes["data-item-id"].value;
    let itemToEdit = duplicate(this.actor.items.get(itemId));
    itemToEdit.data.improvements = Number(event.target.value);

    await this.actor.updateEmbeddedDocuments("Item", [itemToEdit]);
  }

  async _onAbilityFocusOut(event) {
    event.preventDefault();

    let itemId = event.target.attributes["data-item-id"].value;
    let itemToEdit = duplicate(this.actor.items.get(itemId));
    
    if($(event.target).hasClass("abilities-imp"))
      itemToEdit.data.improvements = Number(event.target.value);
    else if($(event.target).hasClass("abilities-mod"))
      itemToEdit.data.mod = Number(event.target.value);
    else
      itemToEdit.data.malus = Number(event.target.value);

    await this.actor.updateEmbeddedDocuments("Item", [itemToEdit]);
  }

  async _onAbilityImprove(event) {
    event.preventDefault();

    // const itemId = event.target.attributes["data-item-id"].value;
    const element = event.currentTarget;
    const dataset = element.dataset;
    const xpSpent = this.actor.data.data.info.xp.spent;

    let itemToEdit = duplicate(this.actor.items.get(dataset.improve));
    const improvements = itemToEdit.data.improvements;
    
    let cost = 1;
    if($(event.target).hasClass("level"))
      cost = 20;

    if(event.button === 0){
      if((this.actor.data.data.info.xp.earned - (this.actor.data.data.info.xp.spent + cost)) < 0 ) {
        ui.notifications.error(game.i18n.format("ERROR.AbilityNoXp"));
        return;
      }

      itemToEdit.data.improvements += cost;
      await this.actor.updateEmbeddedDocuments("Item", [itemToEdit]);
      this.actor.update({[`data.info.xp.spent`]: cost + xpSpent })
    } else {
      if(improvements - cost < 0){ 
        ui.notifications.error(game.i18n.format("ERROR.AbilityLessThanZero"));
        return;
      }

      itemToEdit.data.improvements -= cost;
      await this.actor.updateEmbeddedDocuments("Item", [itemToEdit]);
      this.actor.update({[`data.info.xp.spent`]: xpSpent - cost })
    }
  }

  /**
   * Handle improving a stat and spending XP.
   * @param {Event} event   The originating click event
   * @private
   */
   async _onSkillImprove(event) {
    event.preventDefault();

    const IMPROVEMENT_CAP = 30;

    // const itemId = event.target.attributes["data-item-id"].value;
    const element = event.currentTarget;
    const dataset = element.dataset;
    const xpSpent = this.actor.data.data.info.xp.spent;

    let itemToEdit = duplicate(this.actor.items.get(dataset.improve));
    const improvements = itemToEdit.data.improvements;

    if(event.button === 0){
      // const cost = 4 + Math.floor(improvements / 5) * 2;
      let cost = 0;
      if(itemToEdit.data.trained === "Major")
        cost = 1 + Math.floor(improvements / 5);
      else if(itemToEdit.data.trained === "Minor")
        cost = 2 + Math.floor(improvements / 5) * 2;
      else
        cost = 4 + Math.floor(improvements / 5) * 4;

      // itemToEdit.data.cost = cost;

      if(improvements >= IMPROVEMENT_CAP){
        ui.notifications.error(game.i18n.format("ERROR.SkillImpCap"));
        return;
      }
      if((this.actor.data.data.info.xp.earned - (this.actor.data.data.info.xp.spent + cost)) < 0 ) {
        ui.notifications.error(game.i18n.format("ERROR.SkillNoXp"));
        return;
      }

      if(itemToEdit.data.trained === "Major" && (improvements + 1) % 5 === 0)
        ui.notifications.info(game.i18n.format('SYS.FreeStat'));

      itemToEdit.data.improvements += 1;
      await this.actor.updateEmbeddedDocuments("Item", [itemToEdit]);
      this.actor.update({[`data.info.xp.spent`]: cost + xpSpent })
    } else {
      let cost = 0;
      if(itemToEdit.data.trained === "Major")
        cost = 1 + Math.floor((improvements - 1) / 5);
      else if(itemToEdit.data.trained === "Minor")
        cost = 2 + Math.floor((improvements - 1) / 5) * 2;
      else
        cost = 4 + Math.floor((improvements - 1) / 5) * 4;

      if(improvements <= 0){ 
        ui.notifications.error(game.i18n.format("ERROR.SkillLessThanZero"));
        return;
      }

      itemToEdit.data.improvements -= 1;
      await this.actor.updateEmbeddedDocuments("Item", [itemToEdit]);
      this.actor.update({[`data.info.xp.spent`]: xpSpent - cost })
    }
  }

  /**
   * Handle a click event on a skill name.
   * @param {Event} event   The originating click event
   * @private
   */
  _onSkillClick(event) {
    event.preventDefault();
    const li = $(event.currentTarget).parents(".skill-item-container");
    const skill = this.actor.items.get(li.data("itemId"));

    if(event.button === 0){
      this._performTest(skill);
    } else {
      skill.sheet.render(true);
    }
  }

  async _performTest(skill, testData = {}, armamentDmg = 0, armamentEleDmg = 0, name = null){
    if(Object.keys(testData).length === 0){
      testData = {
        hasDamage: false,
        advantage: 0,
        disadvantage: 0,
        modifier: 0,
        risk: false,
        difficulty: 20,
        damage: 0,
        name: null
      }
    }

    if(name) testData.name = name;

    testData.target = skill.data.data.total;

    //Narvid Racial Bonus
    if((this.actor.data.data.details.species.value === game.i18n.format("SPECIES.Narvid")) && 
    (skill.data.data.stat === 'ws' || skill.data.data.stat === 'agi' || skill.data.data.stat === 'will') &&
    (this.actor.data.data.derived.hp.value > this.actor.data.data.derived.bloodied.value)){
      testData.modifier += 10;
    }

    //Raivo Racial Bonus
    if((this.actor.data.data.details.species.value === game.i18n.format("SPECIES.Raivoaa")) && 
    (skill.data.data.stat === 'ws' || skill.data.data.stat === 'agi' || skill.data.data.stat === 'will') &&
    (this.actor.data.data.derived.hp.value <= this.actor.data.data.derived.bloodied.value)){
      testData.advantage += 1;
    }

    if(canvas.tokens.controlled.length > 0)
      testData.actorName = canvas.tokens.controlled[0].data.name;
    else
      testData.actorName = game.user.name;

    let callback = (html) => {
      testData.advantage = Number(html.find('[name="advantage"]').val());
      testData.disadvantage = Number(html.find('[name="disadvantage"]').val());
      testData.modifier = Number(html.find('[name="modifier"]').val());
      testData.risk = html.find('[name="risk"]').is(':checked');
      testData.difficulty = Number(html.find('[name="difficulty"]').val());
      testData.damage = Number(html.find('[name="damage"]').val()) + this.actor.data.data.stats.str.bonus + armamentDmg;
      testData.elementDamage = Number(html.find('[name="elementDamage"]').val()) + armamentEleDmg;
      return testData;
    }

    let completedRoll = {}
    renderTemplate('systems/tpo/templates/dialog/rollTest.html', testData).then(dlg => {
      new Dialog({
        title: game.i18n.localize("SYS.PerformTest"),
        content: dlg,
        buttons: {
          rollButton: {
            label: game.i18n.localize("SYS.PerformTest"),
            callback: html => {
              callback(html);
              DiceTPO.rollTest(skill, testData).then(result => {return DiceTPO.outputTest(result);});
            }
          },
        },
        default: "rollButton"
      }).render(true);
    });
  }

  _onArmamentExpand(event) {
    event.preventDefault();
    let li = $(event.currentTarget).parents(".expand-container");
    let expand = li.find('.expandable:first')[0];

    if(expand.style.maxHeight){
      expand.style.maxHeight = null;
      expand.style.minHeight = null;
    } else {
      expand.style.maxHeight = "240px";
      expand.style.minHeight = "15px";
    }
  }

  _onArmamentExpandNested(event) {
    event.preventDefault();
    let li = $(event.currentTarget).parents(".expand-container-nested");
    let expand = li.find('.expandable')[0];

    if(expand.style.maxHeight){
      expand.style.maxHeight = null;
      expand.style.minHeight = null;
    } else {
      expand.style.maxHeight = expand.scrollHeight + "px";
      expand.style.minHeight = "15px";
    }
  }

  /**
   * Handle resolve clicks.
   * @param {Event} event   The originating click event
   * @private
   */
  _onResolveToggle(event){
    const element = event.currentTarget;
    console.log(element.id);
    this.actor.update({[`data.info.resolve.${element.id}`]: !this.actor.data.data.info.resolve[element.id] })
  }
}
