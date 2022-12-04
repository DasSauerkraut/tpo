import { UtilsTPO } from "../helpers/utilities.mjs";
import {prepareActiveEffectCategories} from "../helpers/effects.mjs";

/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class tpoActor extends Actor {

  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this.data;
    const data = actorData.data;
    const flags = actorData.flags.tpo || {};

    Object.values(data.stats).forEach(stat => {
      stat.value = stat.initial + stat.modifier + stat.improvements;
      stat.bonus = Math.floor((stat.value) / 10)
      stat.cost = 4 + Math.floor(stat.improvements / 5) * 2
    });

    //data["effects"] = prepareActiveEffectCategories(actorData.effects);

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareItems(actorData);
    this._prepareCharacterData(actorData);
    this._prepareNpcData(actorData);
    console.log(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;

    // Make modifications to data here. For example:
    const data = actorData.data;

    //Max HP
    if(data.autocalc.hp){
      if(data.details.species.value === game.i18n.format("SPECIES.Thulanjos") || data.details.species.value === game.i18n.format("SPECIES.Ildere"))
        data.derived.hp.max = data.stats.con.bonus*3 + data.stats.str.bonus + data.stats.will.bonus * 3;
      else
        data.derived.hp.max = data.stats.con.bonus*5 + data.stats.str.bonus*2 + data.stats.will.bonus;
    }

    //Temp HP
    if(data.autocalc.thp)
      data.derived.tempHp.max = Math.floor(data.derived.hp.max / 2);

    //Base Absorption
    if(data.autocalc.absorption){
      if(data.details.species.value === game.i18n.format("SPECIES.Slepilide") || data.details.species.value === game.i18n.format("SPECIES.Ocnilide")){
        data.derived.absorption.value = Math.floor(data.stats.con.bonus / 2) + 2;
        data.derived.absorption.max = 5;
      } else{
        data.derived.absorption.value = Math.floor(data.stats.con.bonus / 2);
        data.derived.absorption.max = 3;
      }
      if(data.derived.absorption.value > data.derived.absorption.max)
        data.derived.absorption.value = data.derived.absorption.max;
    }
    data.derived.absorption.total = data.derived.absorption.value + data.derived.absorption.armor;

    //Bloodied
    if(data.autocalc.bloodied){
      if(data.details.species.value === game.i18n.format("SPECIES.Narvid")){
        data.derived.bloodied.value = Math.ceil(data.derived.hp.max / 2);
      } else {
        data.derived.bloodied.value = data.stats.con.bonus * 2;
      }
    }
    //Enc Bonus
    data.derived.encumbrance.locations.chest.max = data.stats.str.bonus + 1;
    //Money
    data.derived.encumbrance.money.total = (data.derived.encumbrance.money.l + data.derived.encumbrance.money.s/20 + data.derived.encumbrance.money.c/200).toFixed(2)
    //Splendor
    data.info.splendor.cap = data.stats.cha.bonus*2;
    if(data.info.splendor.items > data.info.splendor.cap)
      data.info.splendor.items = data.info.splendor.cap;

    data.info.splendor.total = data.info.splendor.items + data.info.splendor.mod;

    data.info.splendor.rerolls = Math.floor(data.info.splendor.total / 4);

    //AP
    if(data.autocalc.ap)
      data.derived.ap.max = 4;

    //Movement
    if(data.autocalc.movement){
      if(data.stats.agi.value > 60)
        data.derived.movement.value = 4;
      else
        data.derived.movement.value = 3;
    }
    //XP
    data.info.xp.value = data.info.xp.earned - data.info.xp.spent;
  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;

    // Make modifications to data here. For example:
    const data = actorData.data;
    // data.xp = (data.cr * data.cr) * 100;
  }

  /**
   * Prepare Actor Item specific data.
   */
  _prepareItems(actorData) {
    let basicSkills = [];
    let advancedOrGroupedSkills = [];
    let armaments = [];
    let activeAbilities = [];
    let inactiveAbilities = [];
    let unsortedPowers = [];
    let inventory = {
      lScabbard: [],
      lThigh: [],
      lHip: [],
      lPouch: [],
      chest: [],
      backpack: [],
      rScabbard: [],
      rThigh: [],
      rHip: [],
      rPouch: [],
      nonEnc: []
    }

    actorData.data.derived.encumbrance.locations.backpack.owned = false;
    actorData.data.derived.encumbrance.locations.lPouch.owned = false;
    actorData.data.derived.encumbrance.locations.lScabbard.owned = false;
    actorData.data.derived.encumbrance.locations.rScabbard.owned = false;
    actorData.data.derived.encumbrance.locations.rPouch.owned = false;

    actorData.items.forEach( async i => {
      if(i.data.data.splendor){
        actorData.data.info.splendor.items += i.data.data.splendor;
      }

      if(i.type == "skill"){
        let skill = this.prepareSkill(i.data, actorData);
        if (skill.data.grouped || skill.data.advanced)
          advancedOrGroupedSkills.push(skill)
        else
          basicSkills.push(skill);
      } else if(i.type == "armament"){
        //------------------ACTIVE POWERS--------------------------//
        i.data.data.powers = i.data.data.powers.filter(pwr => {
          return actorData.items.get(pwr._id);
        });
        i.data.data.powers.forEach((pwr, idx) => {
          i.data.data.powers[idx] = actorData.items.get(pwr._id).data;
        })

        if(i.data.data.powers.length !== 0){
          var sort = {"At-Will": 1, "Encounter": 2, "Weekly": 3}
          i.data.data.powers.sort((a, b) => {
            return sort[a.data.type] - sort[b.data.type];
          })
        }
        i.data.data.capacity.currentPowers = i.data.data.powers.length;

        //------------------MISC POWERS--------------------------//
        i.data.data.miscPowers = i.data.data.miscPowers.filter(pwr => {
          return actorData.items.get(pwr._id);
        });
        i.data.data.miscPowers.forEach((pwr, idx) => {
          i.data.data.miscPowers[idx] = actorData.items.get(pwr._id).data;
        })

        i.data.data.miscPowers = UtilsTPO.sortAlphabetically(i.data.data.miscPowers);

        i.data.data.capacity.misc === 0 && i.data.data.miscPowers.length === 0 ? i.data.data.capacity.hasMisc = false : i.data.data.capacity.hasMisc = true;
        i.data.data.capacity.currentMisc = i.data.data.miscPowers.length;

        //------------------UPGRADES--------------------------//
        i.data.data.upgrades = i.data.data.upgrades.filter(pwr => {
          return actorData.items.get(pwr._id);
        });
        i.data.data.upgrades.forEach((pwr, idx) => {
          i.data.data.upgrades[idx] = actorData.items.get(pwr._id).data;
        })
        i.data.data.upgrades = UtilsTPO.sortAlphabetically(i.data.data.upgrades);

        armaments.push(i.data);

        inventory[i.data.data.location].push(i.data)
        actorData.data.derived.encumbrance.locations[i.data.data.location].value += i.data.data.enc;

        //----------------------Arquebus Specific Stuff--------------------//
        if(i.data.data.armamentType === "Arquebus"){
          if(i.data.data.upgrades.some(upg => {return upg.name === 'Double Barreled'}))
            await i.setFlag('tpo', 'loadedAmmo.max', 2)
          else if(i.data.data.upgrades.some(upg => {return upg.name === 'Magazine'}))
            await i.setFlag('tpo', 'loadedAmmo.max', 3)
          else
            await i.setFlag('tpo', 'loadedAmmo.max', 1)
        }

        //---------------------Gun/Lance Stuff----------------------------------//
        if(i.data.data.armamentType === "Lance" || i.data.data.armamentType === "Gunlance"){
          if(i.getFlag('tpo', 'stamina') === undefined){
            await i.setFlag('tpo', 'stamina', {
              pointOne: true,
              pointTwo: true,
              pointThree: true,
              maxCap: 3
            })
          }
          if(i.data.data.upgrades.some(upg => {return upg.name === 'Phial Capacity I'}) && i.getFlag('tpo', 'stamina.pointFour') === undefined)
            await i.setFlag('tpo', 'stamina', {pointFour: true, maxCap: 4})
          if(i.data.data.upgrades.some(upg => {return upg.name === 'Phial Capacity II'})&& i.getFlag('tpo', 'stamina.pointFive') === undefined)
            await i.setFlag('tpo', 'stamina', {pointFive: true, maxCap: 5})
          if(i.data.data.upgrades.some(upg => {return upg.name === 'Phial Capacity III'}) && i.getFlag('tpo', 'stamina.pointSix') === undefined)
            await i.setFlag('tpo', 'stamina', {pointSix: true, maxCap: 6})
        }

        //--------------------Battle Standard----------------------------------//
        if(i.data.data.armamentType === "Battle Standard"){
          if(i.getFlag('tpo', 'orders') === undefined){
            await i.setFlag('tpo', 'orders', [])
          }
        }

        //------------------Vapor Launcher--------------------------------//
        if(i.data.data.armamentType === "Vapor Launcher"){
          if(i.getFlag('tpo', 'magazine') === undefined){
            await i.setFlag('tpo', 'magazine', {
              slotOne: 'Unloaded',
              slotTwo: 'Unloaded',
              slotThree: 'Unloaded',
            })
          }
        }

      } else if(i.type == "power" && !i.data.data.parent.hasParent){
        unsortedPowers.push(i.data);
        inventory.nonEnc.push(i.data)

      } else if(i.type === "ability"){
        i.data.data.value = i.data.data.improvements + i.data.data.mod - Math.abs(i.data.data.malus);
        i.data.data.level = Math.sign(i.data.data.value) * Math.floor(Math.abs(i.data.data.value) / 20);
        if(i.data.data.level !== 0)
          activeAbilities.push(i.data);
        else
          inactiveAbilities.push(i.data);
      } else if(i.type === "item"){
        if(i.data.name === "Pouch"){
          if(actorData.data.derived.encumbrance.locations.lPouch.owned){
            actorData.data.derived.encumbrance.locations.rPouch.owned = true;
            i.update({[`name`]: "rPouch"})
          }else{
            actorData.data.derived.encumbrance.locations.lPouch.owned = true;
            i.update({[`name`]: "lPouch"})
          }
        } else if(i.data.name === "rPouch" || i.data.name === "lPouch"){
          actorData.data.derived.encumbrance.locations[i.data.name].owned = true;
        } else if(i.data.name === "Scabbard"){
          if(actorData.data.derived.encumbrance.locations.lScabbard.owned){
            actorData.data.derived.encumbrance.locations.rScabbard.owned = true;
            i.update({[`name`]: "rScabbard"})

          }else{
            actorData.data.derived.encumbrance.locations.lScabbard.owned = true;
            i.update({[`name`]: "lScabbard"})
          }
        } else if(i.data.name === "rScabbard" || i.data.name === "lScabbard"){
          actorData.data.derived.encumbrance.locations[i.data.name].owned = true;
        } else if(i.data.name === "Backpack" || i.data.name === "backpack"){
          actorData.data.derived.encumbrance.locations.backpack.owned = true;
          i.update({[`name`]: "backpack"})
        } else {
          inventory[i.data.data.location].push(i.data)
          actorData.data.derived.encumbrance.locations[i.data.data.location].value += i.data.data.enc;
        }
      }
    })

    basicSkills = UtilsTPO.sortAlphabetically(basicSkills);
    advancedOrGroupedSkills = UtilsTPO.sortAlphabetically(advancedOrGroupedSkills);
    activeAbilities = UtilsTPO.sortAlphabetically(activeAbilities);
    inactiveAbilities = UtilsTPO.sortAlphabetically(inactiveAbilities);

    const locations = ['lScabbard','lThigh', 'lHip', 'lPouch', 'chest', 'backpack', 'rScabbard', 'rThigh', 'rHip', 'rPouch']

    if(!actorData.flags.tpo)
      actorData.flags['tpo'] = {
        overencumbered: {
          total: 0
        }
      }
    else if (!actorData.flags.tpo['overencumbered'])
      actorData.flags['tpo'] = {
        overencumbered: {
          total: 0
        }
      }
    else
      actorData.flags.tpo['overencumbered']['total'] = 0;
    
      locations.forEach(location => {
      inventory[location] = UtilsTPO.sortAlphabetically(inventory[location]);
      let overenc = actorData.data.derived.encumbrance.locations[location].value - actorData.data.derived.encumbrance.locations[location].max
      if(location === 'chest')
        overenc = actorData.data.derived.encumbrance.locations[location].value - (actorData.data.stats.str.bonus + 1)

      if(overenc > 0 && !location.includes('Scabbard')){
        actorData.flags.tpo['overencumbered'][location] = true;
        actorData.flags.tpo['overencumbered']['total'] += overenc;
      } else {
        actorData.flags.tpo['overencumbered'][location] = false;
      }
    })

    actorData.data.basicSkills = basicSkills;
    actorData.data.advancedOrGroupedSkills = advancedOrGroupedSkills;
    actorData.data.armaments = armaments;
    actorData.data.unsortedPowers = unsortedPowers;
    actorData.data.activeAbilities = activeAbilities;
    actorData.data.inactiveAbilities = inactiveAbilities;
    actorData.data.inventory = inventory;
  }

  prepareSkill(skill, actorData) {
    const data = actorData.data
    skill.data.total = data.stats[skill.data.stat].value + skill.data.improvements;
    skill.data.initial = data.stats[skill.data.stat].value;
    skill.data.statAbrev = game.i18n.format(data.stats[skill.data.stat].abrev)

    let cost = 0;
    if(skill.data.trained === "Major")
      cost = 1 + Math.floor(skill.data.improvements / 5);
    else if(skill.data.trained === "Minor")
      cost = 2 + Math.floor(skill.data.improvements / 5) * 2;
    else
      cost = 4 + Math.floor(skill.data.improvements / 5) * 4;

    skill.data.cost = cost;
    return skill
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();

    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getNpcRollData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.data.type !== 'character') return;

    // Add level for easier access, or fall back to 0.
    if (data.stats.ws) {
      data.ws = data.stats.ws.initial + data.stats.ws.improvements + data.stats.ws.modifier ?? 0;
      data.wsb = data.stats.ws.bonus ?? 0;
    }
    if (data.stats.str) {
      data.str = data.stats.str.initial + data.stats.str.improvements + data.stats.str.modifier ?? 0;
      data.strb = data.stats.str.bonus ?? 0;
    }
    if (data.stats.con) {
      data.con = data.stats.con.initial + data.stats.con.improvements + data.stats.con.modifier ?? 0;
      data.conb = data.stats.con.bonus ?? 0;
    }
    if (data.stats.agi) {
      data.agi = data.stats.agi.initial + data.stats.agi.improvements + data.stats.agi.modifier ?? 0;
      data.agib = data.stats.agi.bonus ?? 0;
    }
    if (data.stats.dex) {
      data.dex = data.stats.dex.initial + data.stats.dex.improvements + data.stats.dex.modifier ?? 0;
      data.dexb = data.stats.dex.bonus ?? 0;
    }
    if (data.stats.int) {
      data.int = data.stats.int.initial + data.stats.int.improvements + data.stats.int.modifier ?? 0;
      data.intb = data.stats.int.bonus ?? 0;
    }
    if (data.stats.will) {
      data.will = data.stats.will.initial + data.stats.will.improvements + data.stats.will.modifier ?? 0;
      data.willb = data.stats.will.bonus ?? 0;
    }
    if (data.stats.cha) {
      data.cha = data.stats.cha.initial + data.stats.cha.improvements + data.stats.cha.modifier ?? 0;
      data.chab = data.stats.cha.bonus ?? 0;
    }
  }

  getStatData(stat, isBonus=false){
    const data = this.data.data;
    if (stat === "ws") {
      let stat = data.stats.ws.initial + data.stats.ws.improvements + data.stats.ws.modifier
      return isBonus ? Math.floor((stat) / 10) : stat
    }
    if (stat === "str") {
      let stat = data.stats.str.initial + data.stats.str.improvements + data.stats.str.modifier
      return isBonus ? Math.floor((stat) / 10) : stat
    }
    if (stat === "con") {
      let stat = data.stats.con.initial + data.stats.con.improvements + data.stats.con.modifier
      return isBonus ? Math.floor((stat) / 10) : stat
    }
    if (stat === "agi") {
      let stat = data.stats.agi.initial + data.stats.agi.improvements + data.stats.agi.modifier
      return isBonus ? Math.floor((stat) / 10) : stat
    }
    if (stat === "dex") {
      let stat = data.stats.dex.initial + data.stats.dex.improvements + data.stats.dex.modifier
      return isBonus ? Math.floor((stat) / 10) : stat
    }
    if (stat === "int") {
      let stat = data.stats.int.initial + data.stats.int.improvements + data.stats.int.modifier
      return isBonus ? Math.floor((stat) / 10) : stat
    }
    if (stat === "will") {
      let stat = data.stats.will.initial + data.stats.will.improvements + data.stats.will.modifier
      return isBonus ? Math.floor((stat) / 10) : stat
    }
    if (stat === "cha") {
      let stat = data.stats.cha.initial + data.stats.cha.improvements + data.stats.cha.modifier
      return isBonus ? Math.floor((stat) / 10) : stat
    }
  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data) {
    if (this.data.type !== 'npc') return;

    // Process additional NPC data here.
  }

}