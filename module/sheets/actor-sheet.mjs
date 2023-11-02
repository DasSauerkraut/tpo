import {onManageActiveEffect, prepareActiveEffectCategories} from "../helpers/effects.mjs";
import { PowersTPO, UtilsTPO } from "../helpers/utilities.mjs";
import { TPO } from "../helpers/config.mjs";

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
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "features" }],
      scrollY: [".window-content", ".skill-container", ".combat-container", "armament-section", ".inventory-col", ".zone-list"],
    });
  }

  /** @override */
  get template() {
    return `systems/tpo/templates/actor/actor-${this.actor.type}-sheet.html`;
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
    const actorData = this.actor.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;
    context.isGm = game.user.isGM;

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
    html.find('.add-item').click(this._onItemCreate.bind(this));

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

    html.find('.zone-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".expand-container");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
    });

    html.find('.zone-name').mousedown(event => {
      if(event.button !== 0){
        this.actor.items.get(event.currentTarget.getAttribute("data-item-id")).sheet.render(true);
      }
    });

    html.find('.zone-input').focusout(this._onAbilityFocusOut.bind(this));

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

    html.find('.money-convert').mousedown(this._onMoneyConvert.bind(this));
    html.find('.mundane-weapon').mousedown(this._onMundaneWeaponClick.bind(this));


    //--------------------------ARMAMENT SPECIFIC-------------------------//
    html.find(".loaded-input").change(this._onAmmoChange.bind(this));
    html.find(".shell-input").change(this._onShellChange.bind(this));
    html.find(".stamina-checkbox").change(this._onStaminaChange.bind(this));
    html.find(".ability-display").click(this._onAbilityDisplay.bind(this));
    html.find(".element-select").click(this._onElementSelect.bind(this));
    html.find(".add-order").click(this._addOrder.bind(this))
    html.find(".order-input").change(this._changeOrder.bind(this))
    html.find(".order-input").mousedown(this._deleteOrder.bind(this))

    // Active Effect management
    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

    html.find('.stat-header').click(this._onStatRoll.bind(this))
    html.find('.stat-total').mousedown(this._onStatImprove.bind(this))

    html.find('.resolve').click(this._onResolveToggle.bind(this));

    html.find('.expand-controller').click(this._onArmamentExpand.bind(this));
    html.find('.expand-controller-nested').click(this._onArmamentExpandNested.bind(this));

    html.find('.expand-popout').hover(this._onPopoutExpand.bind(this));

    html.find('#hp-max').click(event => {
      event.preventDefault();
      this.actor.update({[`system.autocalc.hp`]: !this.actor.system.autocalc.hp })
    })

    html.find('#hp-heal').click(this._onRest.bind(this));

    html.find('#char-roll').click(this._onRollStats.bind(this));

    html.find('#ap-max').click(event => {
      event.preventDefault();
      this.actor.update({[`system.autocalc.ap`]: !this.actor.system.autocalc.ap })
    })

    html.find('#thp-max').click(event => {
      event.preventDefault();
      this.actor.update({[`system.autocalc.thp`]: !this.actor.system.autocalc.thp })
    })

    html.find('#bloodied').click(event => {
      event.preventDefault();
      this.actor.update({[`system.autocalc.bloodied`]: !this.actor.system.autocalc.bloodied })
    })

    html.find('#movement').click(event => {
      event.preventDefault();
      this.actor.update({[`system.autocalc.movement`]: !this.actor.system.autocalc.movement })
    })

    html.find('#absorption').click(event => {
      event.preventDefault();
      this.actor.update({[`system.autocalc.absorption`]: !this.actor.system.autocalc.absorption })
    })
    html.find('#armor-absorption').click(event => {
      event.preventDefault();
      this.actor.update({[`system.autocalc.absorption`]: !this.actor.system.autocalc.absorption })
    })

    html.find('.powerDelete').click(this._onPowerDelete.bind(this))
    html.find('.powerRoll').click(this._onPowerRoll.bind(this))
    html.find('.basic-attack').click(this._onBasicAttack.bind(this))
    html.find('.power-draggable').mousedown(this._onPowerOrArmamentEdit.bind(this))
    html.find('.armament-name').mousedown(this._onPowerOrArmamentEdit.bind(this))

    html.find('.action').click(this._onCombatAction.bind(this))

    html.find('.upgradeDelete').click(ev => {
      let li = $(ev.currentTarget).parents(".expand-container-nested");
      if(!li.data("itemId")){
        li = $(ev.currentTarget).parents(".expand-popout");
      }
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
    })
    html.find('.item-name').mousedown(this._onPowerOrArmamentEdit.bind(this))
    html.find('.stack').mousedown(this._onStackClick.bind(this))
    html.find('.wear-item').click(this._onWearItemToggle.bind(this));


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
    })

    html.on("dragenter", ".unequipped-powers", ev => {
      $(".unequipped-powers").addClass("dragover");
    })
    html.on("dragleave", ".unequipped-powers", ev => {
      $(".unequipped-powers").removeClass("dragover");
    })
    html.on("drop", ".unequipped-powers", ev => {
      $(".unequipped-powers").removeClass("dragover");
    })

    html.on("dragenter", ".zone", ev => {
      ev.target.classList.add("dragover")
    })
    html.on("dragleave", ".zone", ev => {
      ev.target.classList.remove("dragover")
    })
    html.on("drop", ".zone", ev => {
      ev.target.classList.remove("dragover")
    })
  }

  async _onMoneyConvert(event){
    const action = $(event.currentTarget).data('action');
    const money = this.actor.system.derived.encumbrance.money
    switch (action) {
      case "silverToPound":
        if(money.s >= 20){
          await this.actor.update({[`system.derived.encumbrance.money.l`]: money.l + 1, [`system.derived.encumbrance.money.s`]: money.s - 20 })
        }else{
          ui.notifications.error(game.i18n.format('ERROR.NotEnoughSilverToPound'));
        }
        break;
      case "poundToSilver":
        if(money.l >= 1){
          await this.actor.update({[`system.derived.encumbrance.money.l`]: money.l - 1, [`system.derived.encumbrance.money.s`]: money.s + 20 })
        }else{
          ui.notifications.error(game.i18n.format('ERROR.NotEnoughPound'));
        }
        break;
      case "copperToSilver":
        if(money.c >= 10){
          await this.actor.update({[`system.derived.encumbrance.money.c`]: money.c - 10, [`system.derived.encumbrance.money.s`]: money.s + 1 })
        }else{
          ui.notifications.error(game.i18n.format('ERROR.NotEnoughCopper'));
        }
        break;
      case "silverToCopper":
        if(money.s >= 1){
          await this.actor.update({[`system.derived.encumbrance.money.c`]: money.c + 10, [`system.derived.encumbrance.money.s`]: money.s - 1  })
        }else{
          ui.notifications.error(game.i18n.format('ERROR.NotEnoughSilverToCopper'));
        }
        break;
      default:
        break;
    }
  }

  async _onAmmoChange(event) {
    let li = $(event.currentTarget).parents(".expandable");
    if(!li.data("itemId")){
      li = $(event.currentTarget).parents(".armament-container")
    }
    const select = $(event.currentTarget).attr('id');
    const item = this.actor.items.get(li.data("itemId"));
    let flag = {};
    flag[select] = event.currentTarget.value
    await item.setFlag('tpo', 'loadedAmmo', flag)
  }

  async _onShellChange(event) {
    let li = $(event.currentTarget).parents(".expandable");
    if(!li.data("itemId")){
      li = $(event.currentTarget).parents(".armament-container")
    }
    const select = $(event.currentTarget).attr('id');
    const item = this.actor.items.get(li.data("itemId"));
    let flag = {};
    flag[select] = event.currentTarget.value
    await item.setFlag('tpo', 'magazine', flag)
  }

  async _onStaminaChange(event) {
    let li = $(event.currentTarget).parents(".expandable");
    if(!li.data("itemId")){
      li = $(event.currentTarget).parents(".armament-container")
    }
    const select = $(event.currentTarget).attr('id');
    const item = this.actor.items.get(li.data("itemId"));
    const prev = await item.getFlag('tpo', `stamina.${select}`)
    await item.setFlag('tpo', `stamina.${select}`, !prev)
  }

  async _onAbilityDisplay(event) {
    const li = $(event.currentTarget).parents(".expand-container")
    // const select = $(event.currentTarget).attr('id');
    console.log(li)
    const item = this.actor.items.get(li.data("itemId"));
    console.log(item)
    const prev = await item.getFlag('tpo', `combatDisplay`)
    console.log(prev)
    console.log(!prev)
    await item.setFlag('tpo', `combatDisplay`, !prev)
    console.log(await item.getFlag('tpo', `combatDisplay`))
  }

  async _onElementSelect(event) {
    const li = $(event.currentTarget).parents(".armament-container");
    const select = $(event.currentTarget).attr('class');
    const item = this.actor.items.get(li.data("itemId"));
    let selectedElement;
    if(select.includes('fire')){
      selectedElement = 'fire';
    } else if(select.includes('water')){
      selectedElement = 'water';
    } else if(select.includes('ice')){
      selectedElement = 'ice';
    } else if(select.includes('electric')){
      selectedElement = 'elec';
    } else if(select.includes('dragon')){
      selectedElement = 'dragon';
    }
    let itemToEdit = duplicate(item)
    itemToEdit.system.selectedElement[selectedElement] = !itemToEdit.system.selectedElement[selectedElement];
    await this.actor.updateEmbeddedDocuments("Item", [itemToEdit]);
  }

  async _addOrder(event){
    let li = $(event.currentTarget).parents(".expandable");
    if(!li.data("itemId")){
      li = $(event.currentTarget).parents(".armament-container")
    }
    const item = this.actor.items.get(li.data("itemId"));
    let orderArray = await item.getFlag('tpo', `orders`)
    
    orderArray.push({
      id: Date.now(),
      value: "up"
    })
    await item.setFlag('tpo', `orders`, orderArray)
  }

  async _changeOrder(event){
    let li = $(event.currentTarget).parents(".expandable");
    if(!li.data("itemId")){
      li = $(event.currentTarget).parents(".armament-container")
    }
    const item = this.actor.items.get(li.data("itemId"));
    const select = Number($(event.currentTarget).attr('id'));
    let orderArray = await item.getFlag('tpo', `orders`)
    const index = orderArray.findIndex(order => {return order.id === select})

    orderArray[index] = {
      id: select,
      value: event.currentTarget.value
    };
    await item.setFlag('tpo', `orders`, orderArray)
  }

  async _deleteOrder(event){
    if(event.button !== 0) {
      let li = $(event.currentTarget).parents(".expandable");
      if(!li.data("itemId")){
        li = $(event.currentTarget).parents(".armament-container")
      }
      const item = this.actor.items.get(li.data("itemId"));
      const select = Number($(event.currentTarget).attr('id'));
      let orderArray = await item.getFlag('tpo', `orders`)
      const index = orderArray.findIndex(order => {return order.id === select})

      orderArray.splice(index, 1);
      await item.setFlag('tpo', `orders`, orderArray)
    }
  }

  async _onStackClick(event) {
    event.preventDefault();
    const item = this.actor.items.get(event.currentTarget.getAttribute("data-item-id"));
    if(event.button !== 0){
      if(item.system.stack.current > 1){
        let itemToEdit = duplicate(item)
        itemToEdit.system.stack.current -= 1;
        await this.actor.updateEmbeddedDocuments("Item", [itemToEdit]);
      } else {
        ui.notifications.error(game.i18n.format("ERROR.StackLessThanZero"));
      }
    } else {
      if(item.system.stack.current < item.system.stack.max){
        let itemToEdit = duplicate(item)
        itemToEdit.system.stack.current += 1;
        await this.actor.updateEmbeddedDocuments("Item", [itemToEdit]);
      } else {
        ui.notifications.error(game.i18n.format("ERROR.StackCap"));
      }
    }
  }

  _onPowerOrArmamentEdit(event) {
    if(event.button !== 0){
      this.actor.items.get(event.currentTarget.getAttribute("data-item-id")).sheet.render(true);
    }
  }

  _onMundaneWeaponClick(event) {
    if(event.button !== 0){
      this.actor.items.get(event.currentTarget.getAttribute("data-item-id")).sheet.render(true);
    } else {
      const weapon = this.actor.items.get(event.currentTarget.getAttribute("data-item-id"));
      
      if(weapon.system.apCost > this.actor.system.derived.ap.value)
        ui.notifications.error(game.i18n.format('SYS.ExceedsAP'));
      this.actor.update({[`system.derived.ap.value`]: this.actor.system.derived.ap.value - weapon.system.apCost })
  
      let testData = {
        advantage: 0,
        disadvantage: 0,
        modifier: 0,
        risk: false,
        difficulty: 0,
        hasDamage: true,
        weakDamage: false,
        damage: weapon.system.damage,
        element: "",
        elementDamage: 0,
        attacks: 1,
        testInfo: {
          isPower: false,
          apCost: weapon.system.apCost,
          target: null,
          description: weapon.system.descriptionDisplay,
          type: null
        }
      }

      let skill = this.actor.items.getName(`Weapon (Mundane)`);
      if(skill === undefined){
        skill = {
          name: "Weapon Skill",
          system: {
            total: this.actor.system.stats.ws.value
          }
        }
      }
      PowersTPO.performTest(this.actor, skill, testData, 0, 0, weapon.name);
    }
  }

  async _onDragItemStart(ev) {
    let itemId = ev.currentTarget.getAttribute("data-item-id");
    if (!itemId)
      return
    let item = this.actor.items.get(itemId)
    const dragData = {
      type: "Item",
      data: item,
    };
    ev.dataTransfer.setData("text/plain", JSON.stringify(dragData));
    item.delete()
  }

  _onRest(event){
    let skill;
    let testData = {
      advantage: 0,
      disadvantage: 0,
      modifier: 0,
      risk: false,
      difficulty: 0,
      testInfo: {
        isPower: false,
        apCost: 0,
        target: null,
        description: null,
        type: null
      }
    };

    let selectedSupply;
    let selectedSkill;
    let assisting = 0;

    let healOptions = {
      supplies: [
        "No Supplies (SL HP)", 
        "Poor Supplies (SL + 2 HP)", 
        "Common Supplies (SL * 2 HP)", 
        "Fine Supplies (SL * 3 HP, Advantage)", 
        "Safe Location (SL * 2 HP)"
      ],
      hasHeal: this.actor.items.getName("Heal") ? true : false
    }
    let callback = (html) => {
      selectedSupply = html.find('[name="supplies"]').val();
      selectedSkill = html.find('[name="skill"]').val();
      assisting = Number(html.find('[name="assist"]').val());
    }
    renderTemplate('systems/tpo/templates/dialog/restPicker.html', healOptions).then(dlg => {
      new Dialog({
        title: game.i18n.localize("SYS.Rest"),
        content: dlg,
        buttons: {
          rollButton: {
            label: game.i18n.localize("SYS.Rest"),
            callback: async html => {
              callback(html);
              if(selectedSupply.includes("Fine"))
                testData.advantage = 1;

              testData["resting"] = {
                supply: selectedSupply,
                assisting: assisting
              };

              if(selectedSkill === "Heal")
                testData.difficulty = 20

              skill = this.actor.items.getName(selectedSkill);

              if(skill === undefined){
                skill = {
                  name: "Constitution",
                  system: {
                      total: this.actor.system.stats.con.value
                  }
                }
              }
              const result = await PowersTPO.performTest(this.actor, skill, testData, 0, 0, `Resting w/ ${selectedSkill}`);
              let heal = 0;
              const SLs = result.results[0].SLs
              switch (selectedSupply) {
                case "No Supplies (SL HP)":
                  heal = SLs < 1 ? 1 + assisting : SLs + assisting
                  break;
                case "Poor Supplies (SL + 2 HP)":
                  heal = SLs < 1 ? 1 + assisting : SLs + 2 + assisting
                  break;
                case "Common Supplies (SL * 2 HP)":
                  heal = SLs < 1 ? 1 + assisting : SLs * 2 + assisting
                  break;
                case "Fine Supplies (SL * 3 HP, Advantage)":
                  heal = SLs < 1 ? 1+ assisting : SLs * 3 + assisting
                  break;
                case "Safe Location (SL * 2 HP)":
                  heal = SLs < 1 ? 1 + assisting : SLs * 2 + assisting
                  break;
                default:
                  break;
              }
              const currentHp = this.actor.system.derived.hp.value;
              const maxHp = this.actor.system.derived.hp.max;
              this.actor.system.armaments.forEach((armament) => {
                armament.system.powers.forEach(pwr => {
                  if(pwr.system.type === game.i18n.format("PWR.Encounter") && pwr.system.used){
                    this._usePower(pwr._id, armament._id);
                  }
                })
              })
              this.actor.update({
                [`system.derived.hp.value`]: currentHp + heal > maxHp ? maxHp : currentHp + heal, 
                ['system.info.splendor.spent']: 0
              })
            }
          },
        },
        default: "rollButton"
      }).render(true);
    });
  }

  _onRollStats(event){
    new Dialog({
      title:`Randomize This Character's Stats`,
      content:``,
      buttons:{
        yes: {
          icon: "<i class='fas fa-dice'></i>",
          label: `Fresh Stat Randomization`,
          callback: async () => {
            const rollArray = [
              await new Roll(`2d10`).roll(),
              await new Roll(`2d10`).roll(),
              await new Roll(`2d10`).roll(),
              await new Roll(`2d10`).roll(),
              await new Roll(`2d10`).roll(),
              await new Roll(`2d10`).roll(),
              await new Roll(`2d10`).roll(),
              await new Roll(`2d10`).roll(),
            ]
            const culture = this.actor.system.details.species.value;
            this.actor.update({
              [`system.stats.ws.initial`]: rollArray[0].total + TPO.stats[culture].ws,
              [`system.stats.str.initial`]: rollArray[1].total + TPO.stats[culture].str,
              [`system.stats.con.initial`]: rollArray[2].total + TPO.stats[culture].con,
              [`system.stats.agi.initial`]: rollArray[3].total + TPO.stats[culture].agi,
              [`system.stats.dex.initial`]: rollArray[4].total + TPO.stats[culture].dex,
              [`system.stats.int.initial`]: rollArray[5].total + TPO.stats[culture].int,
              [`system.stats.will.initial`]: rollArray[6].total + TPO.stats[culture].will,
              [`system.stats.cha.initial`]: rollArray[7].total + TPO.stats[culture].cha,
            })
          }
        },
        existing: {
          icon: "<i class='fas fa-check'></i>",
          label: `Randomize From Existing Stats`,
          callback: async () => {
            const rollArray = [
              await new Roll(`2d10`).roll(),
              await new Roll(`2d10`).roll(),
              await new Roll(`2d10`).roll(),
              await new Roll(`2d10`).roll(),
              await new Roll(`2d10`).roll(),
              await new Roll(`2d10`).roll(),
              await new Roll(`2d10`).roll(),
              await new Roll(`2d10`).roll(),
            ]
            this.actor.update({
              [`system.stats.ws.initial`]: rollArray[0].total + this.actor.system.stats.ws.initial - 10,
              [`system.stats.str.initial`]: rollArray[1].total + this.actor.system.stats.str.initial - 10,
              [`system.stats.con.initial`]: rollArray[2].total + this.actor.system.stats.con.initial - 10,
              [`system.stats.agi.initial`]: rollArray[3].total + this.actor.system.stats.agi.initial - 10,
              [`system.stats.dex.initial`]: rollArray[4].total + this.actor.system.stats.dex.initial - 10,
              [`system.stats.int.initial`]: rollArray[5].total + this.actor.system.stats.int.initial - 10,
              [`system.stats.will.initial`]: rollArray[6].total + this.actor.system.stats.will.initial - 10,
              [`system.stats.cha.initial`]: rollArray[7].total + this.actor.system.stats.cha.initial - 10,
            })
          }
        },
        no: {
          icon: "<i class='fas fa-cancel'></i>",
          label: `Cancel`
        },
      },
      default:'no',
    }).render(true);
  }

  async  _onCombatAction(event) {
    event.preventDefault();
    const action = $(event.currentTarget).data("action")
    let skill;
    let testData = {
      advantage: 0,
      disadvantage: 0,
      modifier: 0,
      risk: false,
      difficulty: 0,
      testInfo: {
        isPower: false,
        apCost: 0,
        target: null,
        description: null,
        type: null
      }
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

        if(1 > this.actor.system.derived.ap.value)
          ui.notifications.error(game.i18n.format('SYS.ExceedsAP'));
        this.actor.update({[`system.derived.ap.value`]: this.actor.system.derived.ap.value - 1 })

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
                      system: {
                          total: this.actor.system.stats.ws.value
                        },
                    }
                  }
                  PowersTPO.performTest(this.actor, skill, testData, 0, 0, `Defending w/ ${selectedSkill}`);
                  if(selectedSkill === "Dodge")
                    UtilsTPO.playContextSound({type: "combatAction"}, "dodge")
                  else
                    UtilsTPO.playContextSound({type: "combatAction"}, "block")
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
            system: {
                total: this.actor.system.stats.agi.value
              },
          }
          testData.disadvantage = 1;
        }
        if(1 > this.actor.system.derived.ap.value)
          ui.notifications.error(game.i18n.format('SYS.ExceedsAP'));
        this.actor.update({[`system.derived.ap.value`]: this.actor.system.derived.ap.value - 1 })
        testData.testInfo.description = "Attempting to disengage with Dodge."
        PowersTPO.performTest(this.actor, skill, testData, 0, 0, "Disengaging");
        break;
      case "morale":
        skill = this.actor.items.getName("Cool");
        testData.difficulty = 10;

        if((this.actor.system.details.species.value === game.i18n.format("SPECIES.Narvid")) && 
        (this.actor.system.derived.hp.value <= this.actor.system.derived.bloodied.value)){
          testData.disadvantage += 1;
        }

        //Check if Hardened ability
        if(this.actor.items.getName("Hardened")){
          if(this.actor.items.getName("Hardened").system.level > 1)
            testData.advantage += 1
          if(this.actor.items.getName("Hardened").system.level > 0)
            testData.modifier += 10
        }

        if(skill === undefined){
          skill = {
            name: "Willpower",
            system:{
                total: this.actor.system.stats.will.value
            }
          }
        }
        PowersTPO.performTest(this.actor, skill, testData, 0, 0, "Morale Test");
        break;
      case "grapple":
        skill = this.actor.items.getName("Grapple");

        if(2 > this.actor.system.derived.ap.value)
          ui.notifications.error(game.i18n.format('SYS.ExceedsAP'));
        this.actor.update({[`system.derived.ap.value`]: this.actor.system.derived.ap.value - 2 })

        if(skill === undefined){
          skill = {
            name: "Strength",
            system: {
                total: this.actor.system.stats.str.value
            }
          }
          testData.disadvantage = 1;
        }
        testData.testInfo.description = "Fighting is a demanding process, both physically and mentally. Sometimes things don’t go the way they’re supposed to, and sometimes the jaws of panic grip you and you run despite everything."
        PowersTPO.performTest(this.actor, skill, testData, 0, 0, "Grappling");
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

        //Check if Cavalryman ability
        if(this.actor.items.getName("Cavalryman")){
          if(this.actor.items.getName("Cavalryman").system.level > 0)
            testData.advantage += 1
        }

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
                      system: {
                          total: this.actor.system.stats.ws.value
                      }
                    }
                  }
                  PowersTPO.performTest(this.actor, skill, testData, 0, 0, `Attempting Mount Action w/ ${selectedSkill}`);
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
    let li = $(event.currentTarget).parents(".expand-container-nested");
    if(!li.data("itemId"))
      li = $(event.currentTarget).parents(".expand-popout");
    console.log(li.data("itemId"))
    const item = duplicate(this.actor.items.get(li.data("itemId")));
    const armament = duplicate(this.actor.items.get(item.system.parent.id));

    item.system.used = !item.system.used;

    await this.actor.updateEmbeddedDocuments("Item", [item]);
    await UtilsTPO.updateStoredPower(armament, item, this.actor);
  }

  async _usePower(powerId, armamentId){
    const item = duplicate(this.actor.items.get(powerId));
    const armament = duplicate(this.actor.items.get(armamentId));

    item.system.used = !item.system.used;

    await this.actor.updateEmbeddedDocuments("Item", [item]);
    await UtilsTPO.updateStoredPower(armament, item, this.actor);
  }

  /** @override */
  async _onDrop(event) {
    let item = await super._onDrop(event);
    console.log(item)
    if(Array.isArray(item)){
      return item.map(async (i) => {
        // if((i.data.type === "item" || i.data.type === "armament" || i.data.type === "power") && !i.getFlag('tpo', 'isOwned')){
        //   i.setFlag('tpo', 'isOwned', true)
        //   UtilsTPO.payForItem(i.system, this.actor.data._id)
        // }

        if(i.type === "item" || i.type === "armament" || i.type === "mundaneWeapon" || i.type === "wornItem")
          await this._onItemDrop(event, duplicate(i))
        else if (i.type === "power"){
          if($(event.target).parents(".armament-container").length)
            await this._onArmamentDrop(event, duplicate(i))
          else if($(event.target).parents(".zone").length)
            await this._onZoneDrop(event, duplicate(i))
          else
            await this._onPowerUnequip(event, duplicate(i))
        }
      })
    } else {
      if(item.type === "item" || item.type === "armament")
        return await this._onItemDrop(event, duplicate(item))
      else if (item.type === "power"){
        if($(event.target).parents(".armament-container").length)
          return await this._onArmamentDrop(event, duplicate(item))
        else
          return await this._onPowerUnequip(event, duplicate(item))
      }
    }
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

    if(location === undefined)
      location = 'chest'

    UtilsTPO.playContextSound({type: "item"}, "itemEquip")

    let deletedItem = false;
    let toUpdate = []
    if (item.system?.stack?.stackable && this.actor.system.inventory[location].some(itm => itm.name === item.name && itm._id !== item._id)){
      let remainingStack = item.system.stack.current;
      const currentStackables = this.actor.system.inventory[location].filter(itm => itm.name === item.name && itm._id !== item._id)
      await currentStackables.every(async stackable => {
        if(stackable.system.stack.current + remainingStack <= stackable.system.stack.max){
          let newStackable = duplicate(stackable)
          newStackable.system.stack.current += remainingStack;
          toUpdate.push(newStackable);
          remainingStack = 0;
          return false;
        } 
        else if (stackable.system.stack.current !== stackable.system.stack.max){
          let newStackable = duplicate(stackable)
          remainingStack -= newStackable.system.stack.max - newStackable.system.stack.current;
          newStackable.system.stack.current = newStackable.system.stack.max;
          toUpdate.push(newStackable);
          return true;
        }
        return true;
      });

      if(remainingStack === 0 && !deletedItem){
        const itemToDelete = this.actor.items.get(item._id);
        await itemToDelete.delete();
        deletedItem = true;
      } else {
        item.system.stack.current = remainingStack;
      }
    }

    if(!deletedItem){
      item.system.location = location;
      toUpdate.push(item);
    }

    await this.actor.updateEmbeddedDocuments("Item", toUpdate);
  }

  async _onArmamentDrop(event, item){
    event.preventDefault();
    if(item.type === "power"){
      const armamentDiv = $(event.target).parents(".armament-container");
      const armament = duplicate(this.actor.items.get(armamentDiv.data("itemId")));

      if (armament.system.powers.some(power => power._id === item._id)) {
        console.log('Contains dupe, bailing out');
        return;
      }

      item.system.parent.hasParent = true;
      item.system.parent.id = armament._id;
      
      if(item.system.type === "Misc"){
        armament.system.miscPowers.push(item);
        armament.system.capacity.currentMisc = armament.system.powers.length;
      } else if(item.system.type === "Upgrade"){
        armament.system.upgrades.push(item);
      } else {
        armament.system.powers.push(item);
        armament.system.capacity.currentPowers = armament.system.powers.length;
      }
      
      await this.actor.updateEmbeddedDocuments("Item", [item]);
      await this.actor.updateEmbeddedDocuments("Item", [armament]);
      UtilsTPO.playContextSound({type: "item"}, "powerEquip")
    }
  }

  async _onZoneDrop(event, item){
    event.preventDefault();
    if(item.type === "power" && item.system.type !== "upgrade"){
      const zoneDiv = $(event.target).parents(".zone");
      const zone = duplicate(this.actor.items.get(zoneDiv.data("itemId")));

      if (zone.system.powers.some(power => power._id === item._id)) {
        console.log('Contains dupe, bailing out');
        return;
      }

      item.system.parent.hasParent = true;
      item.system.parent.id = zone._id;
      
      zone.system.powers.push(item);
      
      await this.actor.updateEmbeddedDocuments("Item", [item]);
      await this.actor.updateEmbeddedDocuments("Item", [zone]);
      UtilsTPO.playContextSound({type: "item"}, "powerEquip")
    }
  }

  async _onPowerUnequip(event, item){
    event.preventDefault();
    console.log(item)
    if(item.type === "power"){
      if (this.actor.system.unsortedPowers.some(power => power._id === item._id)) {
        console.log('Contains dupe, bailing out');
        return;
      }

      const armament = duplicate(this.actor.items.get(item.system.parent.id));

      if(item.type === "Misc"){
        armament.system.miscPowers = armament.system.miscPowers.filter(( pwr ) => {
          return pwr._id !== item._id;
        });
      } else if(item.type === "Upgrade"){
        armament.system.upgrades = armament.system.upgrades.filter(( pwr ) => {
          return pwr._id !== item._id;
        });
      } else {
        armament.system.powers = armament.system.powers.filter(( pwr ) => {
          return pwr._id !== item._id;
        });
      }

      console.log(armament.system.powers)

      item.system.parent.hasParent = false;
      item.system.parent.id = null;

      if(armament.type !== "zone") {
        armament.system.capacity.currentPowers = armament.system.powers.length;
        armament.system.capacity.misc === 0 && armament.system.miscPowers.length === 0 ? armament.system.capacity.hasMisc = false : armament.system.capacity.hasMisc = true;
        armament.system.capacity.currentMisc = armament.system.miscPowers.length;
      }

      await this.actor.updateEmbeddedDocuments("Item", [item]);
      await this.actor.updateEmbeddedDocuments("Item", [armament]);
      UtilsTPO.playContextSound({type: "item"}, "powerEquip")
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
    const container = $(event.target).parents(".popout");
    const item = this.actor.items.get(container.data("id"));
    item.delete();
  }

  async _onContainerDelete(event){
    event.preventDefault();
    const location = $(event.target).data("location");
    if(this.actor.system.inventory[location].length > 0){
      ui.notifications.error(game.i18n.format('SYS.LocationItems'));
      return;
    }

    await this.actor.update({[`system.inventory.${location}`]: [] })

    const item = this.actor.items.getName(location);
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
      hasDamage: false,
      testInfo: {
        isPower: false,
        apCost: 0,
        target: null,
        description: null,
        type: null
      }
    }
    
    const statOut = {
        name: game.i18n.localize(this.actor.system.stats[stat].label),
        system: {
            total: this.actor.system.stats[stat].value,
            description: TPO.statDescriptions[stat]
        }
      }
      
    PowersTPO.performTest(this.actor, statOut, testData);
  }

  async _onBasicAttack(event){
    let container = null;
    if(event){
      event.preventDefault();
      container = $(event.target).parents(".container-header");
    }

    console.log(container)
    
    const armament = await this.actor.items.get(container.data("armament-id"));
    console.log(armament)
    let skill = this.actor.items.getName(`Weapon (${armament.system.skill})`);

    if(skill === undefined){
      skill = {
        name: "Weapon Skill",
        system: {
          total: this.actor.system.stats.ws.value
        }
      }
    }

    const apCost = 2;
    if(apCost > this.actor.system.derived.ap.value)
      ui.notifications.error(game.i18n.format('SYS.ExceedsAP'));
    this.actor.update({[`system.derived.ap.value`]: this.actor.system.derived.ap.value - apCost })

    let weakDamage = false;
    if(armament.system.armamentType === 'Vapor Launcher' || armament.system.armamentType === 'Arquebus')
      weakDamage = true;

    let damage = armament.system.armamentType === 'Greatsword' ? -4 : 0

    const testData = {
      advantage: 0,
      disadvantage: 0,
      modifier: 0,
      risk: false,
      difficulty: 0,
      hasDamage: true,
      weakDamage: weakDamage,
      damage: damage,
      element: armament.system?.selectedElement?.display,
      elementDamage: 0,
      attacks: 1,
      testInfo: {
        isPower: false,
        apCost: 0,
        target: null,
        description: "Perform a Basic Melee Attack",
        type: null
      }
    }

    PowersTPO.performTest(this.actor, skill, testData, armament.system.damage.value, armament.system.elementDamage.value, "Basic Attack")
  }

  async _onPowerRoll(event, power = null){
    let container = null;
    if(event){
      event.preventDefault();
      container = $(event.target).parents(".subheader");
    }

    if(!container.data("power-id"))
      container = $(event.target).parents(".power");
    
    if(!power)
      power = await this.actor.items.get(container.data("power-id"));
    
    const armament = await this.actor.items.get(power.system.parent.id);

    if(power.system.type === "Daily" || power.system.type === "Adventure"){
      if(power.system.used)
        ui.notifications.info(game.i18n.format('SYS.PowerUsed'));
      else 
        this._usePower(power._id, armament._id);
    }

    if(power.system.apCost > this.actor.system.derived.ap.value)
      ui.notifications.error(game.i18n.format('SYS.ExceedsAP'));
    this.actor.update({[`system.derived.ap.value`]: this.actor.system.derived.ap.value - power.system.apCost })

    const delayMatches = power.system.description.match(/(Delay\s)(\d)/i)

    if (delayMatches?.length > 0 && delayMatches[2] > 0) {
      new Dialog({
        title:'Power has Delay Keyword',
        content:``,
        buttons:{
          yes: {
            icon: "<i class='fas fa-check'></i>",
            label: `Delay [${delayMatches[2]}] Power`,
            callback: () => {
              ui.notifications.info(`TPO | Power has been Delayed. It will trigger after ${delayMatches[2]} turns.`);
              if(this.actor.system?.delayedPowers){
                this.actor.update({
                  [`system.delayedPowers`]: [...this.actor.system.delayedPowers, {
                    delayRemaining: Number(delayMatches[2]),
                    powerId: power.id,
                    armamentId: armament.id
                  }]
                })
              } else {
                this.actor.update({
                  [`system.delayedPowers`]: [{
                    delayRemaining: Number(delayMatches[2]),
                    powerId: power.id,
                    armamentId: armament.id
                  }]
                })
              }
            },
          },
          no: {
            icon: "<i class='fas fa-cancel'></i>",
            label: `Do Not Delay Power`,
            callback: () => {
              PowersTPO.powerRollHelper(this.actor, power, armament)
            }
          }},
        default:'yes',
      }).render(true);
    } else {
      PowersTPO.powerRollHelper(this.actor, power, armament)
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    // Get the type of item to create.
    // Grab any data associated with this control.
    // Initialize a default name.
    const name = `New Item`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: 'item'
    };
    // Remove the type from the dataset since it's in the itemData.type prop.

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

    const improvements = this.actor.system.stats[dataset.improve].improvements;
    const xpSpent = this.actor.system.info.xp.spent;
    const newXpCalc = game.settings.get("tpo", "Xp2");

    if(event.button === 0){
      const cost = 4 + Math.floor(improvements / 5) * 5;

      if(improvements >= IMPROVEMENT_CAP){
        ui.notifications.error(game.i18n.format("ERROR.StatImpCap"));
        return;
      }
      if((this.actor.system.info.xp.earned - (this.actor.system.info.xp.spent + cost)) < 0 ) {
        ui.notifications.error(game.i18n.format("ERROR.StatNoXp"));
        return;
      }
      
      this.actor.update({[
          `system.stats.${dataset.improve}.improvements`]: improvements + 1,
          [`system.info.xp.spent`]: cost + xpSpent 
        })

    } else {
      const cost = 4 + Math.floor((improvements - 1) / 5) * 5;

      if(improvements <= 0){
        ui.notifications.error(game.i18n.format("ERROR.StatLessThanZero"));
        return;
      }

      this.actor.update({
        [`system.stats.${dataset.improve}.improvements`]: improvements - 1,
        [`system.info.xp.spent`]: xpSpent - cost 
      })
    }
    UtilsTPO.playContextSound({type: "skill"}, "improve")
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
    itemToEdit.system.improvements = Number(event.target.value);

    await this.actor.updateEmbeddedDocuments("Item", [itemToEdit]);
  }

  async _onAbilityFocusOut(event) {
    event.preventDefault();

    let itemId = event.target.attributes["data-item-id"].value;
    let itemToEdit = duplicate(this.actor.items.get(itemId));
    
    if($(event.target).hasClass("abilities-imp"))
      itemToEdit.system.improvements = Number(event.target.value);
    else if($(event.target).hasClass("abilities-mod"))
      itemToEdit.system.mod = Number(event.target.value);
    else if($(event.target).hasClass("hp"))
      itemToEdit.system.hp.value = Number(event.target.value);
    else
      itemToEdit.system.malus = Number(event.target.value);

    await this.actor.updateEmbeddedDocuments("Item", [itemToEdit]);
  }

  async _onAbilityImprove(event) {
    event.preventDefault();

    // const itemId = event.target.attributes["data-item-id"].value;
    const element = event.currentTarget;
    const dataset = element.dataset;
    const xpSpent = this.actor.system.info.xp.spent;

    let itemToEdit = duplicate(this.actor.items.get(dataset.improve));
    const improvements = itemToEdit.system.improvements;
    
    let cost = 1;
    if($(event.target).hasClass("level"))
      cost = 20;

    if(event.button === 0){
      if((this.actor.system.info.xp.earned - (this.actor.system.info.xp.spent + cost)) < 0 ) {
        ui.notifications.error(game.i18n.format("ERROR.AbilityNoXp"));
        return;
      }

      itemToEdit.system.improvements += cost;
      await this.actor.updateEmbeddedDocuments("Item", [itemToEdit]);
      this.actor.update({[`system.info.xp.spent`]: cost + xpSpent })
    } else {
      if(improvements - cost < 0){ 
        ui.notifications.error(game.i18n.format("ERROR.AbilityLessThanZero"));
        return;
      }

      itemToEdit.system.improvements -= cost;
      await this.actor.updateEmbeddedDocuments("Item", [itemToEdit]);
      this.actor.update({[`system.info.xp.spent`]: xpSpent - cost })
    }
    UtilsTPO.playContextSound(itemToEdit, "improve")
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
    const xpSpent = this.actor.system.info.xp.spent;
    const newXpCalc = game.settings.get("tpo", "Xp2")

    let itemToEdit = duplicate(this.actor.items.get(dataset.improve));
    const improvements = itemToEdit.system.improvements;

    if(event.button === 0){
      // const cost = 4 + Math.floor(improvements / 5) * 2;
      let cost = 0;
      if(itemToEdit.system.trained === "Major")
        cost = newXpCalc ? 1 + Math.floor(improvements / 5) * 2 : 1 + Math.floor(improvements / 5);
      else if(itemToEdit.system.trained === "Minor")
        cost = newXpCalc ? 2 + Math.floor(improvements / 5) * 3 : 2 + Math.floor(improvements / 5) * 2;
      else
        cost = 4 + Math.floor(improvements / 5) * 4;

      if(improvements >= IMPROVEMENT_CAP){
        ui.notifications.error(game.i18n.format("ERROR.SkillImpCap"));
        return;
      }
      if((this.actor.system.info.xp.earned - (this.actor.system.info.xp.spent + cost)) < 0 ) {
        ui.notifications.error(game.i18n.format("ERROR.SkillNoXp"));
        return;
      }

      let statImp = false;
      if(itemToEdit.system.trained === "Major" && (improvements + 1) % 5 === 0){
        if(newXpCalc){
          if(this.actor.system.stats[itemToEdit.system.stat].improvements + 1 > 20){
            ui.notifications.error(game.i18n.format("ERROR.StatImpCap"));
          } else {
            ui.notifications.info(game.i18n.format('SYS.FreeStatGoverned').replace('#stat', itemToEdit.system.stat.toUpperCase()));
            statImp = true;
          }
        }
        else
          ui.notifications.info(game.i18n.format('SYS.FreeStat'));
      }

      itemToEdit.system.improvements += 1;
      await this.actor.updateEmbeddedDocuments("Item", [itemToEdit]);
      this.actor.update({
        [`system.info.xp.spent`]: cost + xpSpent,
        [`system.stats.${itemToEdit.system.stat}.improvements`]: statImp ? this.actor.system.stats[itemToEdit.system.stat].improvements + 1 : this.actor.system.stats[itemToEdit.system.stat].improvements,
      })
    } else {
      let cost = 0;
      if(itemToEdit.system.trained === "Major")
        cost = newXpCalc ? 1 + Math.floor((improvements - 1) / 5) * 2 : 1 + Math.floor((improvements - 1) / 5);
      else if(itemToEdit.system.trained === "Minor")
        cost = newXpCalc ? 2 + Math.floor((improvements - 1) / 5) * 3 : 2 + Math.floor((improvements - 1) / 5) * 2;
      else
        cost = 4 + Math.floor((improvements - 1) / 5) * 4;

      if(improvements <= 0){ 
        ui.notifications.error(game.i18n.format("ERROR.SkillLessThanZero"));
        return;
      }

      itemToEdit.system.improvements -= 1;
      await this.actor.updateEmbeddedDocuments("Item", [itemToEdit]);
      this.actor.update({[`system.info.xp.spent`]: xpSpent - cost })
    }
    UtilsTPO.playContextSound(itemToEdit, "improve")
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
      PowersTPO.performTest(this.actor, skill);
    } else {
      skill.sheet.render(true);
    }
  }

  _onArmamentExpand(event) {
    event.preventDefault();
    let li = $(event.currentTarget).parents(".expand-container");
    let expand = li.find('.expandable:first')[0];

    if(expand.style.maxHeight){
      expand.style.maxHeight = null;
      expand.style.minHeight = null;
    } else {
      expand.style.maxHeight = expand.scrollHeight + "px";
      expand.style.minHeight = "15px";
    }
  }

  _onPopoutExpand(event) {
    event.preventDefault();
    let li = $(event.currentTarget);
    let expand = $(event.currentTarget).find('.popout')[0];

    if(li.className === "name")
      li = $(li.parents(".expand-popout")[0])

    if(expand.style.display !== "block"){
      expand.style.display = "block";
      expand.style.top = (li.offset().top + 1 )+ "px"
      if(li.hasClass("left"))
        expand.style.left = (li.offset().left - $(expand).width()) + "px"
      else {
        expand.style.left = (li.offset().left + li.width()) + "px"
      }
    } else {
      expand.style.display = "none";
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
  async _onResolveToggle(event){
    const element = event.currentTarget;
    await this.actor.update({[`system.info.resolve.${element.id}`]: !this.actor.system.info.resolve[element.id] })
  }

  async _onWearItemToggle(event){
    event.preventDefault()
    let li = $(event.currentTarget).parents(".inventory-item");
    const item = duplicate(this.actor.items.get(li.data("itemId")));
    console.log(item)

    item.system.worn = !item.system.worn;

    await this.actor.updateEmbeddedDocuments("Item", [item]);
  }
}
