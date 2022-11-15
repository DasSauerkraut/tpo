import { TPO } from "./config.mjs";
export class DiceTPO {
  static async rollTest(skill, rollData) {
    //calculate target
    const target = skill.data.data.total + rollData.modifier + rollData.difficulty;
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
          if(level > 0)
          hasCritEyeOne = true;
        }
        dice.forEach(roll => {
          if(roll % 11 === 0) {
            crits.push(roll);
          } 
          if(hasCritEyeOne && roll % 5 === 0 && roll % 10 !== 0) {
            crits.push(roll);
          } 
          else if(hasCritEyeTwo && roll % 5 === 0) {
            crits.push(roll);
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
      results.push({
        selectedRoll: selectedRoll,
        SLs: SLs,
        dice: dice,
        result: result,
      })
    } 
    //roll dice
    return {
      actorName: rollData.actorName,
      skill: skill,
      risk: rollData.risk,
      target: target,
      name: rollData.name ? rollData.name : skill.name,
      hasDamage: rollData.hasDamage,
      strB: rollData.actor.data.data.stats.str.bonus,
      weakDamage: rollData.weakDamage,
      damage: rollData.damage,
      element: rollData.element,
      elementDamage: rollData.elementDamage,
      results: results
    };
  }

  static outputTest(testData){
    console.log(testData)
    let damageString = ``;
    let elementDamage = testData.elementDamage
    let testOutput = '';
    testData.results.forEach((test) => {
      let damage = testData.damage + test.SLs
      if(testData.hasDamage && !testData.weakDamage)
        damageString = `
          <br />
          <b>Damage:</b>
          <div style="display:flex;justify-content:space-between;height: 34px;">
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

      let critFormat = ''
      if(test.result.includes(game.i18n.localize("ROLL.Crit")))
        if(test.result.includes(game.i18n.localize("ROLL.Success")))
          critFormat="critSuccess"
        else
          critFormat="critFailure"
      
      let testDice = '';
      if(test.dice.length > 1)
        testDice = `<b>Dice:</b> ${test.dice.join(', ')}`
      testOutput += `
        <hr>
        <h3 class="${critFormat}"> ${test.result} </h3>
        <b>Roll${testData.risk ? ` with Risk` : ''}:</b> ${test.selectedRoll} vs ${testData.target} <br>
        <b>SLs:</b> ${test.SLs} <br>
        ${testDice}
        ${damageString}
      `
    })
    let chatContent = `
      <b>${testData.actorName} | ${testData.name}</b><br>
      ${testOutput}
    `
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
        if(item.data.armamentType === "Greatsword" || 
        item.data.armamentType === "Lance" ||
        item.data.armamentType === "Battle Standard" ||
        item.data.armamentType === "Chromatic Sword"
        )
          group = "weapon-swing"
        if(item.data.armamentType === "Leech Blade")
          group = "hit-normal"
        if(item.data.armamentType === "Charge Gauntlets")
          group = "hit-blocked"
        if(item.data.armamentType === "Arquebus" || item.data.armamentType === "Vapor Launcher"){
          if(item.name.toLowerCase().includes("reload") || item.name.toLowerCase().includes("shell swap"))
            group = "weapon_gun-load"
          else if(item.name.toLowerCase().includes("dragonstake") ||
          item.name.toLowerCase().includes("grand overture"))
            group = "weapon_canon-fire"
          else
            group = "weapon_gun-fire"
        }
        if(item.data.armamentType === "Gunlance"){
          if(item.data.target.toLowerCase().includes("ranged") || 
          item.name.toLowerCase().includes("pokeshelling") ||
          item.name.toLowerCase().includes("blast dash"))
            group = "weapon_gun-fire"
          else if (item.name.toLowerCase().includes("slamburst"))
            group = "weapon_canon-fire"
          else if(item.data.target.toLowerCase().includes("melee"))
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
      AudioHelper.play({src : file, volume: game.settings.get("core", "globalInterfaceVolume"), autoplay: true}, localSound)
    }
  }

  static async arquebusPowerHelper(actor, power){
    return new Promise(async (resolve) => {
      const armament = actor.items.get(power.data.parent.id);
      const hasMagazine = armament.data.data.upgrades.some(upg => {return upg.name === 'Magazine'})
      const hasDoubleBarreled = armament.data.data.upgrades.some(upg => {return upg.name === 'Double Barreled'})
      const loaded = armament.getFlag('tpo', 'loadedAmmo')

      if(power.name === 'Fire' || power.name === 'Drakegonne' || power.name === 'Dragonstake' || power.name === 'Wyrmsnare' ||
      power.name === 'Grand Overture' || power.name === 'Overwatch' || power.data.type === "Misc") {
        //Uses Ammo
        if(hasDoubleBarreled){
          if(loaded.slotOne !== 'Unloaded')
            await armament.setFlag('tpo', 'loadedAmmo.slotOne', 'Unloaded')
          else if(loaded.slotTwo !== 'Unloaded')
            await armament.setFlag('tpo', 'loadedAmmo.slotTwo', 'Unloaded')
          else
            ui.notifications.warn(game.i18n.format('SYS.NoAmmoLoaded'));
        } else if (hasMagazine) {
          if(loaded.slotOne !== 'Unloaded')
            await armament.setFlag('tpo', 'loadedAmmo.slotOne', 'Unloaded')
          else if(loaded.slotTwo !== 'Unloaded')
            await armament.setFlag('tpo', 'loadedAmmo.slotTwo', 'Unloaded')
          else if(loaded.slotThree !== 'Unloaded')
            await armament.setFlag('tpo', 'loadedAmmo.slotThree', 'Unloaded')
          else
            ui.notifications.warn(game.i18n.format('SYS.NoAmmoLoaded'));
        } else {
          if(loaded.slotOne !== 'Unloaded')
            await armament.setFlag('tpo', 'loadedAmmo.slotOne', 'Unloaded')
          else
            ui.notifications.warn(game.i18n.format('SYS.NoAmmoLoaded'));
        }
        resolve()
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
          ammo: armament.data.data.miscPowers,
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
                  console.log(response)
                  if(hasMagazine){
                    if(loaded.isEjected){
                      await armament.setFlag('tpo', 'loadedAmmo.slotOne', response.slotOne)
                      await armament.setFlag('tpo', 'loadedAmmo.slotTwo', response.slotTwo)
                      await armament.setFlag('tpo', 'loadedAmmo.slotThree', response.slotThree)
                      //AP Cost Increase
                      if(response.slotTwo !== 'Unloaded' || response.slotThree !== 'Unloaded'){
                        if(2 > actor.data.data.derived.ap.value)
                          ui.notifications.error(game.i18n.format('SYS.ExceedsAP'));
                        await actor.update({[`data.derived.ap.value`]: actor.data.data.derived.ap.value - 2 })
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
                      await actor.update({[`data.derived.ap.value`]: actor.data.data.derived.ap.value + 2 })
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

  static async battleStandardHelper(actor, power){
    return new Promise(async (resolve) => {
      const armament = actor.items.get(power.data.parent.id);
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
      //   const commands = armament.data.data.miscPowers;
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
      const armament = actor.items.get(power.data.parent.id);
      const loaded = armament.getFlag('tpo', 'magazine')

      if(power.name === 'Fire Shell' || power.data.description.includes("Discard 1 shell in the magazine, then")){
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
                  await armament.setFlag('tpo', `magazine.${response.picked}`, 'Unloaded')
                  resolve()
                }
              },
            },
            default: "rollButton"
          }).render(true);
        });
      } else if (power.name === 'Reload'){
        const loadData = {
          ammo: armament.data.data.miscPowers,
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
}