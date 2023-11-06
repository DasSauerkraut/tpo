import { DiceTPO } from "./dice.mjs";
import { UtilsTPO } from "./utilities.mjs";

export class PowersTPO {
  static async powerRollHelper(actor, power, armament) {
    if(armament.system.armamentType === 'Arquebus'){
      await UtilsTPO.arquebusPowerHelper(actor, power).then((ammo) => PowersTPO.preformPower(actor, power, armament, {ammo: ammo}))
    } else if(armament.system.armamentType === 'Warbanner'){
      await UtilsTPO.warbannerHelper(actor, power).then(() => PowersTPO.preformPower(actor, power, armament))
    } else if(armament.system.armamentType === 'Vapor Launcher'){
      await UtilsTPO.vaporLauncherHelper(actor, power).then((ammo) => PowersTPO.preformPower(actor, power, armament, {ammo: ammo}))
    } else if(armament.system.armamentType === 'Leech Blade'){
      await UtilsTPO.leechBladeHelper(actor, power).then((damageBns) => PowersTPO.preformPower(actor, power, armament, {damageBns: damageBns}))
    } else {
      PowersTPO.preformPower(actor, power, armament)
    }
  }

  static preformPower(actor, power, armament, options = {}){
    let usesAmmo = false;
    let ammo;
    if(options.ammo){
      ammo = actor.items.getName(options.ammo).system
      usesAmmo = true;
    }

    let damage = usesAmmo ? ammo.damageMod : power.system.damageMod;
    if(options.damageBns){
      damage = usesAmmo ? Number(ammo.damageMod) + Number(options.damageBns) : Number(power.system.damageMod) + Number(options.damageBns);
    }

    if(!power.name.includes("Reload"))
      UtilsTPO.playContextSound(power, "use")

    let skill = actor.items.getName(`Weapon (${armament.system.skill})`);
    const isArmament = armament.type === "armament"

    let element = ""
    if(isArmament)
      element = armament.system?.selectedElement?.display + " " + power.system?.selectedElement?.display
    else
      element = power.system?.selectedElement?.display

    let testData = {
      advantage: 0,
      disadvantage: 0,
      modifier: 0,
      risk: false,
      difficulty: 0,
      hasDamage: true,
      weakDamage: usesAmmo ? ammo.isWeak : power.system.isWeak,
      damage: damage,
      element: element,
      elementDamage: usesAmmo ? ammo.elementDamageMod : power.system.elementDamageMod,
      attacks: power.system.attacks,
      testInfo: {
        isPower: true,
        apCost: power.system.apCost,
        target: power.system.target,
        description: power.system.descriptionDisplay ? power.system.descriptionDisplay : power.system.description,
        type: power.system.type
      }
    }

    if(skill === undefined){
      skill = {
        name: "Weapon Skill",
        system: {
          total: actor.system.stats.ws.value
        }
      }
    }
    if(testData.attacks < 1){
      let chatContent = `
        <b>${actor.name} | ${power.name}</b><br>
        ${power.system.descriptionDisplay}
      `
      let chatData = {
        content: chatContent,
        user: game.user._id,
      };
      ChatMessage.create(chatData, {});
      return;
    }
    PowersTPO.performTest(actor, skill, testData, isArmament ? armament.system.damage.value : 0, isArmament ? armament.system.elementDamage.value : 0, power.name);
  }

  static async performTest(actor, skill, testData = {}, armamentDmg = 0, armamentEleDmg = 0, name = null){
    return new Promise(resolve => {
      if(Object.keys(testData).length === 0){
        testData = {
          hasDamage: false,
          advantage: 0,
          disadvantage: 0,
          modifier: 0,
          risk: false,
          weakDamage: false,
          difficulty: 20,
          damage: 0,
          name: null,
          testInfo: {
            isPower: false,
            apCost: 0,
            target: null,
            description: null,
            type: null
          }
        }
      }
  
      testData.actor = actor
  
      if(name) testData.name = name;
      console.log(skill)
      testData.target = skill.system.total;
  
      //Narvid Racial Bonus
      if((actor.system.details.species.value === game.i18n.format("SPECIES.Narvid")) && 
      (skill.system.stat === 'ws' || skill.system.stat === 'agi' || skill.system.stat === 'will') &&
      actor.system.derived.hp.value > actor.system.derived.bloodied.value){
        if(UtilsTPO.isInCombat(actor._id))
          testData.modifier += 10;
      }
  
      //Raivo Racial Bonus
      if((actor.system.details.species.value === game.i18n.format("SPECIES.Raivoaa")) && 
      (skill.system.stat === 'ws' || skill.system.stat === 'agi' || skill.system.stat === 'will') &&
      actor.system.derived.hp.value <= actor.system.derived.bloodied.value){
        if(UtilsTPO.isInCombat(actor._id))
          testData.advantage += 1;
      }
  
      testData.actorName = actor.name;

      if(!testData.testInfo?.isPower && skill.system.description && testData.testInfo.description === null){
        testData.testInfo.description = skill.system.description;
      }

      let callback = (html) => {
        testData.advantage = Number(html.find('[name="advantage"]').val());
        testData.disadvantage = Number(html.find('[name="disadvantage"]').val());
        testData.modifier = Number(html.find('[name="modifier"]').val());
        testData.risk = html.find('[name="risk"]').is(':checked');
        testData.difficulty = Number(html.find('[name="difficulty"]').val());
        testData.damage = Number(html.find('[name="damage"]').val()) + actor.system.stats.str.bonus + armamentDmg;
        testData.weakDamage = html.find('[name="weak-damage"]').is(':checked');
        testData.elementDamage = Number(html.find('[name="elementDamage"]').val()) + armamentEleDmg;
        return testData;
      }

      renderTemplate('systems/tpo/templates/dialog/rollTest.html', testData).then(dlg => {
        new Dialog({
          title: game.i18n.localize("SYS.PerformTest"),
          content: dlg,
          buttons: {
            rollButton: {
              label: game.i18n.localize("SYS.PerformTest"),
              callback: html => {
                callback(html);
                DiceTPO.rollTest(skill, testData).then(result => {
                  DiceTPO.prepareChatCard(result).then(context => {
                    DiceTPO.createChatCard(context.chatData, context.chatContext)
                  });
                  resolve(result)
                });
              }
            },
          },
          default: "rollButton"
        }).render(true);
      });
    })
  }
}