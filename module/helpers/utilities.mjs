import { TPO } from "./config.mjs";
export class DiceTPO {
  static async rollTest(skill, rollData) {
    console.log(rollData)
    //calculate target
    const target = skill.data.data.total + rollData.modifier + rollData.difficulty;

    //calculate advantages
    let advantages = rollData.advantage - rollData.disadvantage;
    if(Math.abs(advantages) > 100){
      ui.notifications.warn(game.i18n.format('SYS.ExceedsMaxAdvantage'));
      advantages = 100 * Math.sign(advantages);
    }

    //roll dice
    let dice = [];
    let selectedRoll = 0;
    let didCrit = false;
    let autoSuccess = false;
    let SLs = 0;
    let result = "";

    if(rollData.risk){
      let riskTarget = 50 + advantages * 10;
      let roll1 = await new Roll("1d100").roll({async: true})
      await this.showDiceSoNice(roll1);
      let roll2 = await new Roll("1d100").roll({async: true})
      await this.showDiceSoNice(roll2);
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
        await this.showDiceSoNice(roll);
        roll.terms[0].results.forEach(die => {
          dice.push(die.result)
        })
      } else {
        let roll = await new Roll("1d100").roll({async: true})
        await this.showDiceSoNice(roll);
        dice.push(roll.terms[0].results[0].result);
      }
      dice.sort((a, b) => {return a - b});

      let selectedCrit = null;
      let crits = [];
      let hasCritEyeOne = false;
      let hasCritEyeTwo = false;
      if(rollData.actor && rollData.actor.items.getName("Critical Eye")){
        const level = rollData.actor.items.getName("Critical Eye").data.data.level;
        if(level > 1)
          hasCritEyeTwo = true;
        else if(level > 0)
         hasCritEyeOne = true;
      }
      dice.forEach(roll => {
        if(roll % 11 === 0) {
          crits.push(roll);
          didCrit = true;
        } else if(hasCritEyeOne && roll % 5 === 0) {
          crits.push(roll);
          didCrit = true;
        } else if(hasCritEyeTwo && roll % 10 === 0) {
          crits.push(roll);
          didCrit = true;
        }
      })

      if(advantages > 0) {
        //Advantage
        if(crits.length !== 0){
          selectedCrit = Math.min(...crits);
        }
        if(selectedCrit && selectedCrit <= target) {
          selectedRoll = selectedCrit;
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
        }
        else
          selectedRoll = Math.max(...dice);
      } else {
        //Normal
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
    if(didCrit && didTestSucceed && !autoSuccess)
      SLs = Math.floor((target - 1) / 10);
    else if (didCrit && !didTestSucceed && !autoSuccess)
      SLs = Math.floor((target - 100) / 10);
    else if (!autoSuccess)
      SLs = Math.floor((target - selectedRoll) / 10);
    else 
      SLs = didTestSucceed ? 1 : -1;

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

    if(didCrit)
      result = game.i18n.localize("ROLL.Crit") + ' ' + (didTestSucceed ? game.i18n.localize("ROLL.Success") : game.i18n.localize("ROLL.Failure"));

    //output
    console.log(rollData.actor)
    return {
      actorName: rollData.actorName,
      result: result,
      skill: skill,
      name: rollData.name ? rollData.name : skill.name,
      risk: rollData.risk,
      selectedRoll: selectedRoll,
      target: target,
      SLs: SLs,
      dice: dice,
      hasDamage: rollData.hasDamage,
      weakDamage: rollData.weakDamage,
      damage: rollData.damage,
      strB: rollData.actor.data.data.stats.str.bonus,
      element: rollData.element,
      elementDamage: rollData.elementDamage
    }
  }

  static outputTest(testData){
    let damageString;
    let damage = testData.damage + testData.SLs
    let elementDamage = testData.elementDamage
    if(testData.hasDamage && !testData.weakDamage)
      damageString = `
        <hr>
        <b>Damage:</b>
        <div style="display:flex;justify-content: space-between;">
          <span>
            Raw <div style="text-align:center">${damage}</div>
          </span>
          &nbsp+&nbsp 
          <span>
            ${testData.element}<div style="text-align:center">${elementDamage}</div>
          </span>
          &nbsp=&nbsp
          <b style="color:#642422">
            Strong
            <div style="text-align:center">${damage}</div>
            &nbsp
          </b>
          &nbsp
          <b>
            Neutral
            <div style="text-align:center">${damage + elementDamage}</div>
          </b>
          &nbsp
          <b style="color:#51632C">
            Weak
            <div style="text-align:center">${damage + elementDamage * 3}</div>
          </b>
        </div>
      `
    else if (testData.weakDamage){
      damageString = `
      <hr>
      <b>Weak Damage:</b> ${testData.strB}
      `
    }
    else
     damageString = '';
    
     let chatContent = `
      <b>${testData.actorName} | ${testData.name}</b><br>
      <h3> ${testData.result} </h3>
      <hr>
      <b>Roll${testData.risk ? ` with Risk` : ''}:</b> ${testData.selectedRoll} vs ${testData.target} <br>
      <b>SLs:</b> ${testData.SLs} <br>
      <b>Dice:</b> ${testData.dice.join(', ')}
     ${damageString}`
    let chatData = {
      content: chatContent,
      user: game.user._id,
    };
    ChatMessage.create(chatData, {});
  }

  static async showDiceSoNice(roll) {
    if (game.modules.get("dice-so-nice") && game.modules.get("dice-so-nice").active) {
      await game.dice3d.showForRoll(roll, game.user, true);
    }
  }
}

export class UtilsTPO {
  static sortAlphabetically(toSort){
    toSort.sort((a, b) => {
      let fa = a.name.toLowerCase(),
          fb = b.name.toLowerCase();
  
      if (fa < fb) {
          return -1;
      }
      if (fa > fb) {
          return 1;
      }
      return 0;
    });
    return toSort;
  }

  static async updateStoredPower(armament, power, actor){
    const idx = armament.data.powers.map(pwr => pwr._id).indexOf(power._id);
    armament.data.powers[idx] = power;
    await actor.updateEmbeddedDocuments("Item", [armament]);
  }

  static formatRatingStatus(statuses){
    let count = 0;
    statuses.forEach(s => {
      count += Number(s.data.label.match(/\d+/)[0])
    })
    
    let description = TPO.statuses.filter(s => {
      return game.i18n.format(s.label) === statuses[0].data.label;
    });
    description = description[0].description.replace(/REPLACE/g, count);

    let label = statuses[0].data.label.replace(/[0-9]/g, count);

    return `
      <br>
      <b>${label}</b>
      <div style="display:flex;">
        <img style="width:40px;height:40px;border:none;filter: drop-shadow(0px 0px 7px black);" src="${statuses[0].data.icon}" alt="${label}">
        <div style="margin:0;margin-left:4px;align-self:flex-start">${description}</div>
      </div>
    `
  }
}