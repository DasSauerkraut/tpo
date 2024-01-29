import { OpposedTPO } from "./opposed.mjs";
import { UtilsTPO } from "./utilities.mjs";

export class DiceTPO {
  static async rollTest(skill, rollData, hidden = false) {
    //calculate target
    let target;
    if(skill.system?.total)
      target = skill.system.total + rollData.modifier + rollData.difficulty;
    else 
      target = rollData.target + rollData.modifier + rollData.difficulty
    //calculate advantages
    let advantages = rollData.advantage - rollData.disadvantage;
    if(Math.abs(advantages) > 100){
      ui.notifications.warn(game.i18n.format('SYS.ExceedsMaxAdvantage'));
      advantages = 100 * Math.sign(advantages);
    }
    //Not a power, so it should only roll once for 'attacks'
    if(!rollData.hasDamage)
      rollData.attacks = 1

    let results = [];
    for (let i = 0; i < rollData.attacks; i++) {
      let dice = [];
      let selectedRoll = 0;
      let didCrit = false;
      let autoSuccess = false;
      let SLs = 0;
      let result = "";
      let critEyeBonusActive = false;

      if(rollData.risk){
        let riskTarget = 50 + advantages * 10;
        let roll1 = await new Roll("1d100").roll({async: true})
        if(!hidden) await this.showDiceSoNice(roll1);
        let roll2 = await new Roll("1d100").roll({async: true})
        if(!hidden) await this.showDiceSoNice(roll2);
        dice.push(roll1.total);
        dice.push(roll2.total);

        if(Math.abs(roll1.total - riskTarget) > Math.abs(roll2.total - riskTarget))
          selectedRoll = roll1.total;
        else
          selectedRoll = roll2.total;

        if(selectedRoll % 11 === 0)
          didCrit = true;

      } else {
        if(advantages !== 0){
          let roll = await new Roll(`${Math.abs(advantages)+1}d100${advantages > 0 ? 'kl' : 'kh' }`).roll({async: true})
          console.log(roll)
          if(!hidden) await this.showDiceSoNice(roll);
          roll.terms[0].results.forEach(die => {
            dice.push(die.result)
          })
        } else {
          let roll = await new Roll("1d100").roll({async: true})
          if(!hidden) await this.showDiceSoNice(roll);
          dice.push(roll.terms[0].results[0].result);
        }
        dice.sort((a, b) => {return a - b});

        let selectedCrit = null;
        let crits = [];
        let hasCritEyeOne = false;
        let hasCritEyeTwo = false;
        if(rollData.actor && rollData.actor.items.getName("Critical Eye")){
          const level = rollData.actor.items.getName("Critical Eye").system.level;
          if(level > 1)
            hasCritEyeTwo = true;
          if(level > 0)
            hasCritEyeOne = true;
        }
        dice.forEach(roll => {
          if(roll % 11 === 0) {
            crits.push(roll);
          } 
          if(hasCritEyeOne && roll % 5 === 0 && roll % 10 !== 0) {
            crits.push(roll);
            if(hasCritEyeTwo) {
              critEyeBonusActive = true;
            }
          } 
        })

        if(advantages > 0) {
          //Advantage
          if(crits.length !== 0){
            selectedCrit = Math.min(...crits);
          }
          if(selectedCrit && selectedCrit <= target) {
            selectedRoll = selectedCrit;
            didCrit = true;
          }
          else
            selectedRoll = Math.min(...dice);
        } else if (advantages < 0) {
          //Disadvantage
          if(crits.length !== 0){
            selectedCrit = Math.max(...crits);
          }
          if(selectedCrit && selectedCrit > target) {
            selectedRoll = selectedCrit;
            didCrit = true;
          }
          else
            selectedRoll = Math.max(...dice);
        } else {
          //Normal
          if(crits.length !== 0)
            didCrit = true;

          selectedRoll = dice[0];
        }
      }
      

      //compare vs target
      let didTestSucceed = selectedRoll <= target;
      // Auto success/failure
      if(selectedRoll <= 5 && !didTestSucceed){
        didTestSucceed = true;
        autoSuccess = true;
      }else if (selectedRoll >= 95 && didTestSucceed){
        didTestSucceed = false;
        autoSuccess = true;
      }

      //get SLs
      if(didCrit && didTestSucceed && !autoSuccess){
        SLs = Math.floor((target - 0) / 10);
        if(critEyeBonusActive)
          SLs += 2;
      }
      else if (didCrit && !didTestSucceed && !autoSuccess)
        SLs = Math.floor((target - 100) / 10);
      else if (!autoSuccess)
        SLs = Math.floor((target - selectedRoll) / 10);
      else 
        SLs = didTestSucceed ? 1 : -1;

      result = DiceTPO.getTestResults(SLs, didTestSucceed)

      if(didCrit)
        result = game.i18n.localize("ROLL.Crit") + ' ' + (didTestSucceed ? game.i18n.localize("ROLL.Success") : game.i18n.localize("ROLL.Failure"));

      if(autoSuccess)
        result = game.i18n.localize("ROLL.Auto") + ' ' + result;
      //output
      results.push({
        selectedRoll: selectedRoll,
        SLs: SLs,
        dice: dice,
        result: result,
      })
    } 
    //roll dice
    console.log(rollData.actor)
    return {
      actorName: rollData.actorName,
      actorId: {
        isToken: rollData.actor.parent !== null,
        id: rollData.actor.parent !== null ? rollData.actor.parent._id : rollData.actor._id,
      },
      skill: skill,
      risk: rollData.risk,
      target: target,
      name: rollData.name ? rollData.name : skill.name,
      hasDamage: rollData.hasDamage,
      strB: rollData.actor.system.stats.str.bonus,
      weakDamage: rollData.weakDamage,
      damage: rollData.damage,
      element: rollData.element,
      elementDamage: rollData.elementDamage,
      testData: rollData,
      testInfo: rollData.testInfo,
      results: results
    };
  }

  static getTestResults (SLs, didTestSucceed) {
    let result;
    switch (Math.abs(SLs)) {
      case 0:
      case 1:
        result = game.i18n.localize("ROLL.Marginal") + ' ' + (didTestSucceed ? game.i18n.localize("ROLL.Success") : game.i18n.localize("ROLL.Failure"));
        break;
      case 2:
      case 3:
        result = didTestSucceed ? game.i18n.localize("ROLL.Success") : game.i18n.localize("ROLL.Failure");
        break;
      case 4:
      case 5:
        result = game.i18n.localize("ROLL.Impressive") + ' ' + (didTestSucceed ? game.i18n.localize("ROLL.Success") : game.i18n.localize("ROLL.Failure"));
        break;
      case 6:
        result = game.i18n.localize("ROLL.Astounding") + ' ' + (didTestSucceed ? game.i18n.localize("ROLL.Success") : game.i18n.localize("ROLL.Failure"));
        break;
    
      default:
        if(Math.abs(SLs) > 6)
          result = game.i18n.localize("ROLL.Astounding") + ' ' + (didTestSucceed ? game.i18n.localize("ROLL.Success") : game.i18n.localize("ROLL.Failure"));
        break;
    }
    return result;
  }

  static async prepareChatCard(testData, rerolled = false){
    let damageString = ``;
    let elementDamage = testData.elementDamage
    let testOutput = '';
    let healString = '';
    let testSymbol = '';
    let contextResults = [];

    testData.results.forEach( async (test) => {
      let damage = testData.damage + test.SLs
      if(testData.hasDamage && !testData.weakDamage){
        switch (testData.element) {
          case "Fire ":
            testSymbol = '<i class="fas fa-fire"></i>'
            break;
          case "Elec. ":
            testSymbol = '<i class="fas fa-bolt"></i>'
            break;
          case "Water ":
            testSymbol = '<i class="fas fa-tint"></i>'
            break;
          case "Ice ":
            testSymbol = '<i class="far fa-snowflake"></i>'
            break;
          case "Dragon ":
            testSymbol = '<i class="fas fa-dragon"></i>'
            break;
          default:
            testSymbol = '<i class="fas fa-fist-raised"></i>';
            break;
        }
        if(elementDamage > 0)
          if(game.user.targets.size > 0) {
            damageString = `
              <b>Damage:</b>
                <div style="display:flex;gap: 3px; text-align:center;">
                  <span>
                    <i class="fas fa-fist-raised" data-tooltip="Raw"></i> ${damage}
                  </span>
                  &nbsp+&nbsp 
                  <span>
                    ${testData.element}${elementDamage}
                  </span>
                </div>
              `
          } else {
            damageString = `
            <b>Damage:</b>
            <div style="display:flex;justify-content:space-between;height: 34px; text-align:center;">
              <span>
                <i class="fas fa-fist-raised" data-tooltip="Raw"></i> <div style="text-align:center">${damage}</div>
              </span>
              &nbsp+&nbsp 
              <span>
                ${testData.element}<div style="text-align:center">${elementDamage}</div>
              </span>
              &nbsp=&nbsp
              <b style="color:#642422">
                Resists
                <div style="text-align:center">${damage + Math.floor(elementDamage * 0.5)}</div>
                &nbsp
              </b>
              &nbsp
              <b>
                Neutral
                <div style="text-align:center">${damage + elementDamage}</div>
              </b>
              &nbsp
              <b style="color:#51632C">
                Vulnerable
                <div style="text-align:center">${damage + (elementDamage * 2)}</div>
              </b>
            </div>
          `
          }
        else
        damageString = `
            <span>
              <b>Damage:</b> ${damage} <i class="fas fa-fist-raised" data-tooltip="Raw"></i>
            </span>
          `
      }else if (testData.weakDamage){
        testSymbol = '<i class="fas fa-fist-raised"></i>';
        damageString = `
        <b>Weak Damage:</b> ${testData.strB}
        `
      }
      if(testData.testData.resting){
        const actor = UtilsTPO.getActor(testData.actorId)
        let healAmount;
        testSymbol = '<i class="fas fa-heartbeat"></i>'
        const assisting = testData.testData.resting.assisting
        switch (testData.testData.resting.supply) {
          case "No Supplies (SL HP)":
            healAmount = test.SLs < 1 ? 1 + assisting : test.SLs + assisting;
            healString = `
              <b>Resting with no Supplies:</b><br>
              ${testData.actorName} healed ${healAmount} HP.
            `
            break;
          case "Poor Supplies (SL + 2 HP)":
            healAmount = test.SLs < 1 ? 1 + assisting + 2: test.SLs + 2 + assisting
            healString = `
              <b>Resting with Poor Supplies:</b><br>
              ${testData.actorName} healed ${healAmount} HP.
            `
            break;
          case "Common Supplies (SL * 2 HP)":
            healAmount = test.SLs < 1 ? 1 + assisting : test.SLs * 2 + assisting
            healString = `
              <b>Resting with Common Supplies:</b><br>
              ${testData.actorName} healed ${healAmount} HP.
            `
            break;
          case "Fine Supplies (SL * 3 HP, Advantage)":
            healAmount = test.SLs < 1 ? 1+ assisting : test.SLs * 3 + assisting
            healString = `
              <b>Resting with Fine Supplies:</b><br>
              ${testData.actorName} healed ${healAmount} HP.
            `
            break;
          case "Safe Location (SL * 2 HP)":
            healAmount = test.SLs < 1 ? 1 + assisting : test.SLs * 2 + assisting
            healString = `
              <b>Resting in a safe location:</b><br>
              ${testData.actorName} healed ${healAmount} HP.
            `
            break;
          default:
            break;
        }
        let actorNewHp;
        let remainingWounds;
        if(actor) {
          const currentHp = actor.system.derived.hp.value;
          const maxHp = actor.system.derived.hp.max
          actorNewHp = currentHp + healAmount > maxHp ? maxHp : currentHp + healAmount 

          remainingWounds = actor.system.derived.wounds.value;
        }
        healString += `
        ${actorNewHp ? `New HP: ${actorNewHp}|${actor.system.derived.hp.max}` : ''}
        ${remainingWounds ? `<br>Healed 1 Wound.<br>Remaining Wounds: ${remainingWounds}` : ''}
        <br>All Daily Powers refreshed.
        `
      }

      let critFormat = ''
      if(test.result.includes(game.i18n.localize("ROLL.Crit")))
        if(test.result.includes(game.i18n.localize("ROLL.Success")))
          critFormat="critSuccess"
        else
          critFormat="critFailure"
      
      let testDice = '';
      if(test.dice.length > 1)
        testDice = `<b>Dice:</b> ${test.dice.join(', ')} <br>`
      testOutput += `
        <hr>
        <h3 class="${critFormat}"> ${test.result} </h3>
        <b>Roll${testData.risk ? ` with Risk` : ''}:</b> ${test.selectedRoll} vs ${testData.target} 
        <br>
        <b>SLs:</b> ${test.SLs} <br>
        ${testDice} 
        ${damageString}
        ${healString}
      `

      contextResults.push({
        roll: test.selectedRoll,
        sl: test.SLs,
        success: test.result.includes(game.i18n.localize("ROLL.Success")),
        damage: {
          hasDamage: testData.hasDamage,
          raw: testData.weakDamage ? testData.strB : damage,
          elementDamage: testData.weakDamage ? 0 : elementDamage,
          element: testData.element,
        }
      })
    })

    let chatDescription;
    if(testData.testInfo.isPower){
      chatDescription = `
      <span class="tpo expand-popout left">
        ${testData.name} <i class="far fa-info-circle" style="font-size: 12px;color: grey;"></i>
        <div class="tpo popout ${testData.testInfo.type}-border" style="left: 1356.81px; display: none; position: fixed; z-index: 1; top: 77px; right: 0px; width: 400px; border: 2px solid rgb(96, 96, 96); box-shadow: rgba(0, 0, 0, 0.48) 6px 4px 6px 0px; border-radius: 4px; min-height: 20px;color: var(--color-text-light-2); font-weight: normal;font-family: EBGaramond;">
          <div class="subheader ${testData.testInfo.type}" style="display: flex;-webkit-box-pack: justify;-ms-flex-pack: justify;justify-content: space-between;font-size: 12px;border-bottom: 1px solid var(--color-border-light-primary);">
            <span class="cost">${testData.testInfo.apCost} AP</span>
            <span class="target">
              Target ${testData.testInfo.target}
            </span>
          </div>
          <div class="description" style="background-color:#BFAC8C;color:var(--color-text-dark-1);padding-bottom: 1px;padding-top: 1px;">
            ${testData.testInfo.description}
          </div>
        </div>
      </span>
      `
    } else {
      chatDescription = `
      <span class="tpo expand-popout left">
        ${testData.name} <i class="far fa-info-circle"></i>
        <div class="tpo popout" style="left: 1356.81px; display: none; position: fixed; z-index: 1; top: 77px; right: 0px; width: 400px; border: 2px solid rgb(96, 96, 96); box-shadow: rgba(0, 0, 0, 0.48) 6px 4px 6px 0px; border-radius: 4px; min-height: 20px;color: var(--color-text-light-2); font-weight: normal;font-family: EBGaramond;">
          <div class="description" style="background-color:#BFAC8C;color:var(--color-text-dark-1);padding-bottom: 1px;padding-top: 1px;">
            ${testData.testInfo.description}
          </div>
        </div>
      </span>
      `
    }
    

    let chatContent = `
      <b>${testSymbol} ${testData.actorName} | ${rerolled ? 'Rerolled' : ''} ${chatDescription}</b><a class="tpo opposed-tst" style="float:right;" data-tooltip="Start Opposed Test w/ Targets"><i class="fas fa-exchange-alt"></i></a> <br>
      ${testOutput}
    `
    let chatData = {
      content: chatContent,
      user: game.user._id,
    };
    return {
      chatData: chatData,
      chatContext: {
        rerolled: rerolled,
        testData: duplicate(testData.testData),
        result: contextResults,
        actorId: testData.actorId,
        skill: duplicate(testData.skill)
      }
    }
  }

  static async createChatCard(chatData, chatContext, macro){
    const message = await ChatMessage.create(chatData, {});
    await message.setFlag('tpo', 'context', {
      rerolled: chatContext.rerolled,
      testData: chatContext.testData,
      actorId: chatContext.actorId,
      skill: chatContext.skill,
      result: chatContext.result,
      opposed: false,
      macro: macro
    })
    DiceTPO.handleOpposed(message, macro)
  }

  static handleOpposed(message, macro) {
    const context = message.getFlag('tpo', 'context')
    if(context && 
      context?.actorId && 
      UtilsTPO.getActor(context.actorId).getFlag('tpo', 'opposed') &&
      UtilsTPO.getActor(context.actorId).getFlag('tpo', 'opposed').length > 0) {
      OpposedTPO.defenderRoll(message.id, context.actorId, macro)
    } else if(game.user.targets.size > 0) {
      OpposedTPO.startOpposedTest(message.id, macro)
    }
  }

  static async showDiceSoNice(roll) {
    if (game.modules.get("dice-so-nice") && game.modules.get("dice-so-nice").active) {
      await game.dice3d.showForRoll(roll, game.user, true);
    }
  }
}
