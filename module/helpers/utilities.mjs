import { TPO } from "./config.mjs";
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
      results: results
    };
  }

  static async prepareChatCard(testData, rerolled = false){
    let damageString = ``;
    let elementDamage = testData.elementDamage
    let testOutput = '';
    let healString = '';
    let testSymbol = '';

    testData.results.forEach((test) => {
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
        testSymbol = '<i class="fas fa-heartbeat"></i>'
        const assisting = testData.testData.resting.assisting
        switch (testData.testData.resting.supply) {
          case "No Supplies (SL HP)":
            healString = `
              <b>Resting with no Supplies:</b><br>
              ${testData.actorName} healed ${test.SLs < 1 ? 1 + assisting : test.SLs + assisting} HP.
            `
            break;
          case "Poor Supplies (SL + 2 HP)":
            healString = `
              <b>Resting with Poor Supplies:</b><br>
              ${testData.actorName} healed ${test.SLs < 1 ? 1 + assisting + 2: test.SLs + 2 + assisting} HP.
            `
            break;
          case "Common Supplies (SL * 2 HP)":
            healString = `
              <b>Resting with Common Supplies:</b><br>
              ${testData.actorName} healed ${test.SLs < 1 ? 1 + assisting : test.SLs * 2 + assisting} HP.
            `
            break;
          case "Fine Supplies (SL * 3 HP, Advantage)":
            healString = `
              <b>Resting with Fine Supplies:</b><br>
              ${testData.actorName} healed ${test.SLs < 1 ? 1+ assisting : test.SLs * 3 + assisting} HP.
            `
            break;
          case "Safe Location (SL * 2 HP)":
            healString = `
              <b>Resting in a safe location:</b><br>
              ${testData.actorName} healed ${test.SLs < 1 ? 1 + assisting : test.SLs * 2 + assisting} HP.
            `
            break;
          default:
            break;
        }
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
        <b>Roll${testData.risk ? ` with Risk` : ''}:</b> ${test.selectedRoll} vs ${testData.target} <br>
        <b>SLs:</b> ${test.SLs} <br>
        ${testDice} 
        ${damageString}
        ${healString}
      `
    })

    let chatContent = `
      <b>${testSymbol} ${testData.actorName} | ${rerolled ? 'Rerolled' : ''} ${testData.name}</b><br>
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
        actorId: testData.actorId,
        skill: duplicate(testData.skill)
      }
    }
  }

  static async createChatCard(chatData, chatContext){
    const message = await ChatMessage.create(chatData, {});
    await message.setFlag('tpo', 'context', {
      rerolled: chatContext.rerolled,
      testData: chatContext.testData,
      actorId: chatContext.actorId,
      skill: chatContext.skill
    })
  }

  static async showDiceSoNice(roll) {
    if (game.modules.get("dice-so-nice") && game.modules.get("dice-so-nice").active) {
      await game.dice3d.showForRoll(roll, game.user, true);
    }
  }
}

export class UtilsTPO {
  static sortAlphabetically(toSort){
    toSort = this.cleanArray(toSort);
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
  
  static cleanArray(arr){
    return arr.filter(a => {
      return a !== undefined && a !== null
    })
  }

  static async updateStoredPower(armament, power, actor){
    const idx = armament.system.powers.map(pwr => pwr._id).indexOf(power._id);
    armament.system.powers[idx] = power;
    await actor.updateEmbeddedDocuments("Item", [armament]);
  }

  static formatRatingStatus(statuses){
    let count = 0;
    statuses.forEach(s => {
      let match = s.label.match(/\d+/);
      count += match ? Number(match[0]) : 0
    })
    
    let description = TPO.statuses.filter(s => {
      return game.i18n.format(s.label) === statuses[0].label;
    });
    description = description[0].description.replace(/REPLACE/g, count);

    let label = statuses[0].label.replace(/[0-9]/g, count);

    return `
      <br>
      <b>${label}</b>
      <div style="display:flex;">
        <img style="width:40px;height:40px;border:none;filter: drop-shadow(0px 0px 7px black);" src="${statuses[0].icon}" alt="${label}">
        <div style="margin:0;margin-left:4px;align-self:flex-start">${description}</div>
      </div>
    `
  }

  static async playContextSound(item, context = ""){
    let files;
    let localSound = true;
    await FilePicker.browse("user", "/systems/tpo/sounds/").then(resp => {
      files = resp.files
    })
    let group;
    switch(item.type){
      case "skill":
        if(context === "improve")
          group = "click"
        break;
      case "ability":
        if(context === "improve")
          group = "click"
        break;
      case "power":
        localSound = false;
        if(item.system.armamentType === "Greatsword" || 
        item.system.armamentType === "Lance" ||
        item.system.armamentType === "Warbanner" ||
        item.system.armamentType === "Chromatic Sword"
        )
          group = "weapon-swing"
        if(item.system.armamentType === "Leech Blade")
          group = "hit-normal"
        if(item.system.armamentType === "Charge Gauntlets")
          group = "hit-blocked"
        if(item.system.armamentType === "Arquebus" || item.system.armamentType === "Vapor Launcher"){
          if(item.name.toLowerCase().includes("reload") || item.name.toLowerCase().includes("shell swap"))
            group = "weapon_gun-load"
          else if(item.name.toLowerCase().includes("dragonstake") ||
          item.name.toLowerCase().includes("grand overture"))
            group = "weapon_canon-fire"
          else
            group = "weapon_gun-fire"
        }
        if(item.system.armamentType === "Gunlance"){
          if(item.system.target.toLowerCase().includes("ranged") || 
          item.name.toLowerCase().includes("pokeshelling") ||
          item.name.toLowerCase().includes("blast dash"))
            group = "weapon_gun-fire"
          else if (item.name.toLowerCase().includes("slamburst"))
            group = "weapon_canon-fire"
          else if(item.system.target.toLowerCase().includes("melee"))
            group = "weapon-swing"
        }
        break;
      case "item":
        if(context === "powerEquip")
          group = "weapon-equip"
        else if (context === "itemEquip")
          group = "item-equip"
        break;
      case "combatAction":
        localSound = false;
        if(context === "dodge")
          group = "weapon_throw-fire"
        else if (context === "block")
          group = "weapon_shield-miss_melee"
        break;
      case "roundChange":
        group = "round-change"
        break;
      case "damage":
        localSound = false;
        if(context === "major")
          group = "hit-crit-"
        else if(context === "minor")
          group = "hit-blocked_armour"
        else
          group = "hit-normal-"
        break;
    }

    if(group){
      const groupedFiles = files.filter(f => f.includes(group))
      const roll = await new Roll(`1d${groupedFiles.length}`).roll({async: true})
      let file = groupedFiles[roll.total - 1]
      console.log(`tpo | Playing Sound: ${file}. Volume: ${game.settings.get("core", "globalInterfaceVolume")}. Local: ${localSound}`)
      AudioHelper.play({src : file, volume: game.settings.get("core", "globalInterfaceVolume"), autoplay: true}, !localSound)
    }
  }

  static async arquebusPowerHelper(actor, power){
    return new Promise(async (resolve) => {
      console.log(power)
      const armament = actor.items.get(power.system.parent.id);
      const hasMagazine = armament.system.upgrades.some(upg => {return upg.name === 'Magazine'})
      const hasDoubleBarreled = armament.system.upgrades.some(upg => {return upg.name === 'Double Barreled'})
      const loaded = armament.getFlag('tpo', 'loadedAmmo')

      if(power.name === 'Fire' || power.name === 'Drakegonne' || power.name === 'Dragonstake' || power.name === 'Wyrmsnare' ||
      power.name === 'Grand Overture' || power.name === 'Overwatch' || power.system.type === "Misc") {
        //Uses Ammo
        let firedAmmo;
        if(hasDoubleBarreled){
          if(loaded.slotOne !== 'Unloaded'){
            firedAmmo = loaded.slotOne;
            await armament.setFlag('tpo', 'loadedAmmo.slotOne', 'Unloaded')
          }else if(loaded.slotTwo !== 'Unloaded'){
            firedAmmo = loaded.slotTwo;
            await armament.setFlag('tpo', 'loadedAmmo.slotTwo', 'Unloaded')
          }else
            ui.notifications.warn(game.i18n.format('SYS.NoAmmoLoaded'));
        } else if (hasMagazine) {
          if(loaded.slotOne !== 'Unloaded'){
            firedAmmo = loaded.slotOne;
            await armament.setFlag('tpo', 'loadedAmmo.slotOne', 'Unloaded')
          }else if(loaded.slotTwo !== 'Unloaded'){
            firedAmmo = loaded.slotTwo;
            await armament.setFlag('tpo', 'loadedAmmo.slotTwo', 'Unloaded')
          }else if(loaded.slotThree !== 'Unloaded'){
            firedAmmo = loaded.slotThree;
            await armament.setFlag('tpo', 'loadedAmmo.slotThree', 'Unloaded')
          }else
            ui.notifications.warn(game.i18n.format('SYS.NoAmmoLoaded'));
        } else {
          if(loaded.slotOne !== 'Unloaded'){
            firedAmmo = loaded.slotOne;
            await armament.setFlag('tpo', 'loadedAmmo.slotOne', 'Unloaded')
          }else
            ui.notifications.warn(game.i18n.format('SYS.NoAmmoLoaded'));
        }
        resolve(firedAmmo)
      } else if (power.name.includes('Reload')) {
        let response = {}
        let callback = (html) => {
          response = {
            'slotOne': html.find('[name="slotOne"]').val(),
            'slotTwo': html.find('[name="slotTwo"]').val(),
            'slotThree': html.find('[name="slotThree"]').val(),
            'eject': html.find('[name="eject"]').is(':checked')
          }
          return response;
        }

        //Makes sure the Is Ejected check does not happen when the magazine upgrade is not installed.
        let isEjected = loaded.isEjected;
        if(!hasMagazine)
          isEjected = true;

        const loadData = {
          ammo: armament.system.miscPowers,
          hasDoubleBarreled: hasDoubleBarreled,
          hasMagazine: hasMagazine,
          isEjected: isEjected,
          maxLoaded: loaded.max,
          loaded: loaded
        }

        let title = isEjected ? game.i18n.localize("SYS.LoadArquebus") : game.i18n.localize("SYS.EjectMagazine") 
    
        renderTemplate('systems/tpo/templates/dialog/loadArquebus.html', loadData).then(dlg => {
          new Dialog({
            title: title,
            content: dlg,
            buttons: {
              rollButton: {
                label: title,
                callback: async html => {
                  callback(html);
                  if(hasMagazine){
                    if(loaded.isEjected){
                      await armament.setFlag('tpo', 'loadedAmmo.slotOne', response.slotOne)
                      await armament.setFlag('tpo', 'loadedAmmo.slotTwo', response.slotTwo)
                      await armament.setFlag('tpo', 'loadedAmmo.slotThree', response.slotThree)
                      //AP Cost Increase
                      if(response.slotTwo !== 'Unloaded' || response.slotThree !== 'Unloaded'){
                        if(2 > actor.system.derived.ap.value)
                          ui.notifications.error(game.i18n.format('SYS.ExceedsAP'));
                        await actor.update({[`data.derived.ap.value`]: actor.system.derived.ap.value - 2 })
                        await armament.setFlag('tpo', 'loadedAmmo.isEjected', false)
                      }
                      UtilsTPO.playContextSound(power, "use")
                    } else {
                      await armament.setFlag('tpo', 'loadedAmmo.isEjected', true)
                      await armament.setFlag('tpo', 'loadedAmmo.slotOne', 'Unloaded')
                      await armament.setFlag('tpo', 'loadedAmmo.slotTwo', 'Unloaded')
                      await armament.setFlag('tpo', 'loadedAmmo.slotThree', 'Unloaded')
                    }
                  } else if (hasDoubleBarreled){
                    const slotOneDiffers = response.slotOne !== loaded.slotOne
                    const slotTwoDiffers = response.slotTwo !== loaded.slotTwo
                    if(slotOneDiffers && slotTwoDiffers && power.name !== 'Emergency Reload'){
                      ui.notifications.error(game.i18n.format('SYS.CannotLoadBoth'));
                      await actor.update({[`data.derived.ap.value`]: actor.system.derived.ap.value + 2 })
                    } else {
                      await armament.setFlag('tpo', 'loadedAmmo.slotOne', response.slotOne)
                      await armament.setFlag('tpo', 'loadedAmmo.slotTwo', response.slotTwo)
                      UtilsTPO.playContextSound(power, "use")
                    }
                  } else {
                    await armament.setFlag('tpo', 'loadedAmmo.slotOne', response.slotOne)
                    UtilsTPO.playContextSound(power, "use")
                  }
                  resolve()
                }
              },
            },
            default: "rollButton"
          }).render(true);
        });
      } else {
        resolve()
      }
    })
  }

  static async warbannerHelper(actor, power){
    return new Promise(async (resolve) => {
      const armament = actor.items.get(power.system.parent.id);
      let orderArray = await armament.getFlag('tpo', `orders`)

      if(power.name.includes("Ordered")){
        const loadData = {
          genius: power.name === "Ordered Genius"
        }
        let response = {}

        let callback = (html) => {
          response = {
            'orderOne': html.find('[name="orderOne"]').val(),
            'orderTwo': html.find('[name="orderTwo"]').val(),
          }
          return response;
        }

        renderTemplate('systems/tpo/templates/dialog/orderPicker.html', loadData).then(dlg => {
          new Dialog({
            title: game.i18n.localize("SYS.SelectOrder"),
            content: dlg,
            buttons: {
              rollButton: {
                label: game.i18n.localize("SYS.SelectOrder"),
                callback: async html => {
                  callback(html);
                  console.log(response)
                  orderArray.push({
                    id: Date.now(),
                    value: response.orderOne
                  })
                  if(response.orderTwo !== undefined){
                    orderArray.push({
                      id: Date.now(),
                      value: response.orderTwo
                    })
                  }
                  await armament.setFlag('tpo', `orders`, orderArray)
                  resolve();
                }
              },
            },
            default: "rollButton"
          }).render(true);
        });
      } else {
        resolve()
      }
      // else if(power.name === "Execute Commands"){
      //   const commands = armament.system.miscPowers;
      //   console.log(commands)
      //   const loadData = {
      //     orders: orderArray,
      //     commands: commands
      //   }
      //   let response = {}

      //   let callback = (html) => {
      //     response = {
      //       'orderOne': html.find('[name="orderOne"]').val(),
      //       'orderTwo': html.find('[name="orderTwo"]').val(),
      //     }
      //     return response;
      //   }

      //   renderTemplate('systems/tpo/templates/dialog/orderPicker.html', loadData).then(dlg => {
      //     new Dialog({
      //       title: game.i18n.localize("SYS.SelectOrder"),
      //       content: dlg,
      //       buttons: {
      //         rollButton: {
      //           label: game.i18n.localize("SYS.SelectOrder"),
      //           callback: async html => {
      //             callback(html);
      //             console.log(response)
      //             orderArray.push({
      //               id: Date.now(),
      //               value: response.orderOne
      //             })
      //             if(response.orderTwo !== undefined){
      //               orderArray.push({
      //                 id: Date.now(),
      //                 value: response.orderTwo
      //               })
      //             }
      //             await armament.setFlag('tpo', `orders`, orderArray)
      //           }
      //         },
      //       },
      //       default: "rollButton"
      //     }).render(true);
      //   });
      // }
    })
  }

  static async vaporLauncherHelper(actor, power){
    return new Promise((resolve) => {
      const armament = actor.items.get(power.system.parent.id);
      const loaded = armament.getFlag('tpo', 'magazine')

      if(power.name === 'Fire Shell' || power.system.description.includes("Discard 1 shell in the magazine, then")){
        const loadData = {
          loaded: loaded
        }
        let response = {}

        let callback = (html) => {
          response = {
            'picked': html.find('[name="picker"]').val(),
          }
          return response;
        }

        const title = power.name === 'Fire Shell' ?  game.i18n.localize("SYS.FireShell") : game.i18n.localize("SYS.DiscardShell")

        renderTemplate('systems/tpo/templates/dialog/shellPicker.html', loadData).then(dlg => {
          new Dialog({
            title: title,
            content: dlg,
            buttons: {
              rollButton: {
                label: title,
                callback: async html => {
                  callback(html);
                  const firedShell = armament.getFlag('tpo', `magazine.${response.picked}`)
                  await armament.setFlag('tpo', `magazine.${response.picked}`, 'Unloaded')
                  power.name === 'Fire Shell' ? resolve(firedShell) : resolve()
                }
              },
            },
            default: "rollButton"
          }).render(true);
        });
      } else if (power.name === 'Reload'){
        const loadData = {
          ammo: armament.system.miscPowers,
          maxLoaded: 3,
          isEjected: true
        }
        let response = {}

        let callback = (html) => {
          response = {
            'slotOne': html.find('[name="slotOne"]').val(),
            'slotTwo': html.find('[name="slotTwo"]').val(),
            'slotThree': html.find('[name="slotThree"]').val(),
          }
          return response;
        }

        renderTemplate('systems/tpo/templates/dialog/loadArquebus.html', loadData).then(dlg => {
          new Dialog({
            title: game.i18n.localize("SYS.LoadShells"),
            content: dlg,
            buttons: {
              rollButton: {
                label: game.i18n.localize("SYS.LoadShells"),
                callback: async html => {
                  callback(html);
                    await armament.setFlag('tpo', 'magazine.slotOne', response.slotOne)
                    await armament.setFlag('tpo', 'magazine.slotTwo', response.slotTwo)
                    await armament.setFlag('tpo', 'magazine.slotThree', response.slotThree)
                    UtilsTPO.playContextSound(power, "use")
                    resolve()
                }
              },
            },
            default: "rollButton"
          }).render(true);
        });
      } else {
        resolve()
      }
    })
  }

  static async leechBladeHelper(actor, power){
    return new Promise(resolve => {
      const armament = actor.items.get(power.system.parent.id);
      const hasSpite = armament.system.upgrades.some(upg => {return upg.name === 'Spite'})
      const hasVitalLeech = armament.system.upgrades.some(upg => {return upg.name === 'Vital Leech'})
      const hasSpiritualLeech = armament.system.upgrades.some(upg => {return upg.name === 'Spiritual Leech'})
      const leechRegExp = /(Leech )(\d+)/g
      const leechMatches = [...power.system.description.matchAll(leechRegExp)]

      if(leechMatches.length > 0){
        const leechValue = leechMatches[0][2];
        let damageChange = 0;
        let hpChange = 0;

        if(hasSpite && actor.system.derived.hp.value < actor.system.derived.bloodied.value){
          damageChange = leechValue;
        }
        resolve(damageChange)
      }
      resolve()
    })
  }

  static addResolveRerollToChatCard(options){
    options.push({
      name: game.i18n.localize("SYS.RerollWithResolve"),
      icon: '<i class="fas fa-dice"></i>',
      condition: (li) => {
        const message = game.messages.get(li.data("message-id"))
        const context = message.getFlag('tpo', 'context')
        let actor;
        if(context.actorId.isToken)
          actor = canvas.scene.tokens.get(context.actorId.id).getActor()
        else
          actor = game.actors.get(context.actorId.id)
        return !context.rerolled && UtilsTPO.hasResolve(actor)
      },
      callback: li => {
        const message = game.messages.get(li.data("message-id"))
        let context = message.getFlag('tpo', 'context')
        let actor;
        if(context.actorId.isToken)
          actor = canvas.scene.tokens.get(context.actorId.id).getActor()
        else
          actor = game.actors.get(context.actorId.id)
        if(!context.rerolled && UtilsTPO.hasResolve(actor)){
          context.testData.actor = actor;
          const skill = actor.items.get(context.skill._id)
          DiceTPO.rollTest(skill ? skill : context.skill, context.testData).then(result => {
            DiceTPO.prepareChatCard(result, true).then(chatCard => {
              DiceTPO.createChatCard(chatCard.chatData, chatCard.chatContext)
            })
          })
          message.setFlag('tpo', 'context.rerolled', true)
          UtilsTPO.removeResolve(actor)
        }
      }
    })
  }

  static hasResolve(actor){
    return (actor.system.info.resolve.resolve1 || actor.system.info.resolve.resolve2 || actor.system.info.resolve.resolve3);
  }

  static async removeResolve(actor){
    if(actor.system.info.resolve.resolve3) {
      await actor.update({[`data.info.resolve.resolve3`]: false })
    } else if(actor.system.info.resolve.resolve2) {
      await actor.update({[`data.info.resolve.resolve2`]: false })
    } else if(actor.system.info.resolve.resolve1) {
      await actor.update({[`data.info.resolve.resolve1`]: false })
    }
  }

  static onRoundChange(combat){
    if(!game.user.isGM)
      return;

    if(canvas.scene.tokens.get(combat.previous.tokenId)){
      const prevCombatant = canvas.scene.tokens.get(combat.previous.tokenId)
      const flags = prevCombatant.actor.flags;

      if(flags?.tpo?.rechargePowers.length > 0){
        let potentialRechargedPowers = '';
        let notCharged = '';
        const roll = new Roll('1d100').roll({async: false}).total
        flags.tpo.rechargePowers.forEach(pwr => {
          if(Number(pwr.target) >= roll)
            potentialRechargedPowers += `${pwr.name} - ${pwr.target}<br>`
          else
            notCharged += `${pwr.name} - ${pwr.target}<br>`
        })
        potentialRechargedPowers = potentialRechargedPowers === '' ? '' : '<b>One of the following can be charged:</b><br>' + potentialRechargedPowers;
        notCharged = notCharged === '' ? '' : '<hr><b>Uncharged</b><br>' + notCharged;

        let chatContent = `
          <h3>Recharging ${prevCombatant.actor.name}'s Powers</h3>
          <h4>Roll: ${roll}</h4>
          ${potentialRechargedPowers}
          ${notCharged}
          `
        let chatData = {
          content: chatContent,
          user: game.user._id,
          whisper: [game.users.find(i => i.isGM).id],
        };
        ChatMessage.create(chatData, {});
      }
    }
      
    let combatant = canvas.scene.tokens.get(combat.current.tokenId);
    
    combatant.actor.update({"system.derived.ap.value": combatant.actor.system.derived.ap.max})
    let apMessage = `AP refreshed to ${combatant.actor.system.derived.ap.max}.`

    let statuses = ``;
    if(combatant.actor.effects.size !== 0){
      statuses = `
        <hr>
        <div>${combatant.actor.system.name} is under the following effects!<div>
      `
    }

    if(combatant.actor.type === "largenpc"){
      combatant.actor.system.zones.forEach(zone => {
        let brokenEffects = ``
        if(zone.flags?.tpo?.broken){
          brokenEffects += `
          <b>Broken ${zone.name}</b>
          ${zone.system.brokenEffect}`
        }
        if(statuses !== ``)
          statuses += brokenEffects
        else
        statuses = `
        <hr>
        <div>${combatant.actor.system.name} is under the following effects!<div>
        ${brokenEffects}
      `
      })
    }

    let bleedings = [];
    let exhausteds = [];
    let ongoings = [];
    let paralyzeds = [];
    let hampereds = [];
    combatant.actor.effects.forEach(effect => {
      console.log(effect)
      if(effect.label.includes("Bleeding")){
        bleedings.push(effect);
        return;
      }
      if(effect.label.includes("Exhausted")){
        exhausteds.push(effect);
        return;
      }
      if(effect.label.includes("Ongoing")){
        ongoings.push(effect);
        return;
      }
      if(effect.label.includes("Paralyzed")){
        paralyzeds.push(effect);
        return;
      }
      if(effect.label.includes("Hampered")){
        hampereds.push(effect);
        return;
      }
      let lookup = TPO.statuses.filter(s => {
        return game.i18n.format(s.label) === effect.label;
      });

      let isInjury;
      if(lookup.length === 0){
        lookup = TPO.injuries.filter(s => {
          return game.i18n.format(s.label) === effect.label;
        });
        isInjury = lookup.length !== 0
      }

      let description;
      if(lookup.length === 0){
        description = "No Description."
      }else
        description = lookup[0].description;
      
      statuses += `
        <br>
        <b>${effect.label}</b>
        <div style="display:flex;">
          <img style="width:40px;height:40px;border:none;filter: drop-shadow(0px 0px 7px black);" src="${isInjury ? lookup[0].icon : effect.icon}" alt="${effect.label}">
          <div style="margin:0;margin-left:4px;align-self:flex-start">${description}</div>
        </div>
      `
    });

    if(bleedings.length > 0) statuses += UtilsTPO.formatRatingStatus(bleedings);
    if(exhausteds.length > 0) statuses += UtilsTPO.formatRatingStatus(exhausteds);
    if(ongoings.length > 0) statuses += UtilsTPO.formatRatingStatus(ongoings);
    if(paralyzeds.length > 0) statuses += UtilsTPO.formatRatingStatus(paralyzeds);
    if(hampereds.length > 0) statuses += UtilsTPO.formatRatingStatus(hampereds);

    const overencumbered = combatant.actor.getFlag('tpo', 'overencumbered')
    if(overencumbered.total > 0){

      let description = 'Movement is reduced by 1sq.'
      if(overencumbered.total > 4)
        description = 'Cannot move.<br>Disadvantage on all physical actions.'
      else if (overencumbered.total > 2)
        description = 'Movement reduced by 2sq.<br>Disadvantage on all physical actions'

      statuses += `
        <br>
        <b>Overencumbered ${overencumbered.total}</b>
        <div style="display:flex;">
          <img style="width:40px;height:40px;border:none;filter: drop-shadow(0px 0px 7px black);" src="icons/svg/barrel.svg" alt="overencumbered">
          <div style="margin:0;margin-left:4px;align-self:flex-start">${description}</div>
        </div>
      `
    }

    let abilities = ``
    if((combatant.actor.system.details.species.value === game.i18n.format("SPECIES.Thulanjos") || 
    combatant.actor.system.details.species.value === game.i18n.format("SPECIES.Ildere")) &&
    combatant.actor.system.derived.hp.value < combatant.actor.system.derived.hp.max){
      abilities += `
      <br><b>${combatant.actor.system.details.species.value} - Adrenaline</b><br>
      <div>${game.i18n.format("ABILITY.Adrenaline")}</div>
      `
      const currentTempHp = combatant.actor.system.derived.tempHp.value
      const maxTempHp = combatant.actor.system.derived.tempHp.max
      combatant.actor.update({"data.derived.tempHp.value": currentTempHp + 2 > maxTempHp ? maxTempHp : currentTempHp + 2})
    }

    if(combatant.actor.system.details.species.value === game.i18n.format("SPECIES.Raivoaa") &&
    combatant.actor.system.derived.hp.value <= combatant.actor.system.derived.bloodied.value)
      abilities += `
      <br><b>${game.i18n.format("SPECIES.Raivoaa")} - Berserk</b><br>
      <div>${game.i18n.format("ABILITY.Berserk")}</div>
      `

    if(combatant.actor.system.details.species.value === game.i18n.format("SPECIES.Narvid") &&
    combatant.actor.system.derived.hp.value > combatant.actor.system.derived.bloodied.value)
      abilities += `
      <br><b>${game.i18n.format("SPECIES.Narvid")} - Wavering</b><br>
      <div>${game.i18n.format("ABILITY.Wavering")}</div>
      `

    const auldlonder = combatant.actor.items.getName("Auldlonder")
    if(auldlonder){
      if(auldlonder.system.level > 1 && combat.current.round > 2){
        abilities += `
        <br><b>${game.i18n.format("SPECIES.Auldlonder")} - Persistence</b><br>
        <div>${game.i18n.format("ABILITY.Persistance2")}</div>
        `
        combatant.actor.update({"data.derived.movement.value": combatant.actor.system.derived.movement.value + 1})
      }else if (auldlonder.system.level > 0 && combat.current.round > 3){
        abilities += `
        <br><b>${game.i18n.format("SPECIES.Auldlonder")} - Persistence</b><br>
        <div>${game.i18n.format("ABILITY.Persistance1")}</div>
        `
        combatant.actor.update({"data.derived.movement.value": combatant.actor.system.derived.movement.value + 1})
      }
    }
    
    if(combatant.actor.items.getName("Momentous")){
      const momentous = combatant.actor.items.getName("Momentous")
      if(momentous.system.level > 1 && combat.current.round > 2){
        abilities += `
        <br><b>Momentous - Level 2</b><br>
        <div>${game.i18n.format("ABILITY.Momentous2")}</div>
        `
        combatant.actor.update({"data.derived.ap.value": combatant.actor.system.derived.ap.max + 1})
        apMessage = `AP refreshed to ${combatant.actor.system.derived.ap.max + 1}.`
      }else if (momentous.system.level > 0 && combat.current.round > 3){
        abilities += `
        <br><b>Momentous  - Level 1</b><br>
        <div>${game.i18n.format("ABILITY.Momentous1")}</div>
        `
        combatant.actor.update({"data.derived.ap.value": combatant.actor.system.derived.ap.max + 1})
        apMessage = `AP refreshed to ${combatant.actor.system.derived.ap.max + 1}.`
      }
    }

    let chatContent = `
        <h3>${combatant.actor.name}'s turn!</h3>
        ${apMessage}
        ${abilities}
        ${statuses}`
      let chatData = {
        content: chatContent,
        user: game.user._id,
      };
      ChatMessage.create(chatData, {});
      UtilsTPO.playContextSound({type: "roundChange"})
  }

  static payForItem(item, actorId){
    if(Number(item.value.total) > 0){
      console.log('has value')
      const chatContent = ``
      const chatData = {
        content: chatContent,
        user: game.user._id,
      };
      ChatMessage.create(chatData, {})
    }
  }

  static isInCombat(id) {
    if(game.combat?.combatants){
      const inCombat = [...game.combat.combatants.entries()].find(([key, val]) => {
        return val.actorId === id
      })
      if(inCombat)
        return true
    }
  }
}