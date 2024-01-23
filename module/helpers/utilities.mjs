import { TPO } from "./config.mjs";
import { DiceTPO } from "./dice.mjs";

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

  static formatRatingStatus(statuses, combatant){
    let count = 0;
    let isEnded = false;
    statuses.forEach(s => {
      let match = s.label.match(/\d+/);
      count += match ? Number(match[0]) : 0

      if(s.isTemporary && (Number.isNumeric(s.duration.remaining) && (s.duration.remaining <= 0))) {
        isEnded = true
      }
    })
    
    let description = TPO.statuses.filter(s => {
      return game.i18n.format(s.label) === statuses[0].label;
    });
    description = description[0].description.replace(/REPLACE/g, count);

    let label = statuses[0].label.replace(/[0-9]/g, count);
    const icon = statuses[0].icon

    if(isEnded)
      statuses.forEach(s => {
        combatant.actor.effects.get(s.id).delete()
      })

    return `
      <br>
      <b>${label}${isEnded ? " Ended!" : ""}</b>
      <div style="display:flex;">
        <img style="width:40px;height:40px;border:none;filter: drop-shadow(0px 0px 7px black);" src="${icon}" alt="${label}">
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
        return !context?.rerolled && !context?.opposedTest && UtilsTPO.hasResolve(UtilsTPO.getActor(context.actorId))
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

  static addDamageOptionToChatCard(options){
    options.push({
      name: game.i18n.localize("SYS.ApplyDamage"),
      icon: '<i class="fas fa-swords"></i>',
      condition: (li) => {
        const message = game.messages.get(li.data("message-id"))
        const context = message.getFlag('tpo', 'context')
        return context?.opposedTest && game.user.isGM
      },
      callback: li => {
        const message = game.messages.get(li.data("message-id"))
        let context = message.getFlag('tpo', 'context')
        if(UtilsTPO.getActor(context.defenderId).isOwner)
          UtilsTPO.applyDamage(context.defenderId, context.damage, false, li.data("message-id"), context.macro, context.result)
      }
    })
  }

  static addPiercingDamageOptionToChatCard(options){
    options.push({
      name: game.i18n.localize("SYS.ApplyPiercingDamage"),
      icon: '<i class="fas fa-bullseye-arrow"></i>',
      condition: (li) => {
        const message = game.messages.get(li.data("message-id"))
        const context = message.getFlag('tpo', 'context')
        return context?.opposedTest && game.user.isGM
      },
      callback: li => {
        const message = game.messages.get(li.data("message-id"))
        let context = message.getFlag('tpo', 'context')
        if(UtilsTPO.getActor(context.defenderId).isOwner)
          UtilsTPO.applyDamage(context.defenderId, context.damage, true, li.data("message-id"), context.macro, context.result)
      }
    })
  }

  static async applyDamage(id, damageArray, piercing, messageId = null, macro = null, result = {}, usesUuid = false) {
    let actor;
    if(usesUuid)
      actor = await fromUuid(id);
    else
      actor = UtilsTPO.getActor(id);
    const abs = actor.system.derived.absorption.total;

    let damageTaken = 0;

    if(macro) {
      result["messageId"] = messageId
      const macrosToFire = UtilsTPO.getMacrosByTrigger("beforeDamage", macro)
      macrosToFire.forEach(m => {
        UtilsTPO.fireMacro("before-applying-damage", m.type, m.script, {result: result})
      })
    }

    damageArray.forEach(async damage => {
      let damageInstance = piercing ? damage : damage - abs;
      if (damageInstance <= 0) damageInstance = 1;
      damageTaken += damageInstance;
    })

    if(damageTaken >= 10)
      UtilsTPO.playContextSound({type: "damage"}, "major")
    else if (damageTaken >= 3)
      UtilsTPO.playContextSound({type: "damage"}, "normal")
    else
      UtilsTPO.playContextSound({type: "damage"}, "minor")
    
    const tempHp = actor.system.derived.tempHp.value
    const hp = actor.system.derived.hp.value
    let chatContent = `<br>Inflicted ${damageTaken} ${piercing ? "Piercing ": ""}Damage ${messageId === null ? ` to ${actor.name}`: ""}!`
    let newHp = hp;
    let newTempHp = tempHp;
    if(tempHp > 0){
      if(tempHp - damageTaken >= 0){
        newTempHp = tempHp - damageTaken;
        chatContent += `
        <b>${actor.name}</b><br>
        <div>Temp. HP absorbs the blow!<br>Temp. HP: ${tempHp} → ${newTempHp}</div>
        `
      } else {
        newTempHp = 0;
        newHp = hp - (damageTaken - tempHp)
        chatContent += `
        <b>${actor.name}</b><br>
        <div>Temp. HP softens the blow!
        <br>Temp. HP: ${tempHp} → ${0}
        <br>HP: ${hp} → ${newHp}</div>
        `
      }
    } else {
      newHp -= damageTaken;
    }
    if(hp > actor.system.derived.bloodied?.value && newHp <= actor.system.derived.bloodied?.value){
      chatContent += `
        ${chatContent !== '' ? '<hr>': ''}<b>${actor.name} is Bloodied!</b><br>
        <div>
          They must perform a Morale Test, Roll on the Injury Table, and gain 2 Wounds.
        </div>
        <div>
          <button class="injury-btn" data-actor-id="${actor.id}" data-injury-type="minor">Minor Injury</button>
         </div>
         `
        
    }
    if(hp > 0 && newHp <= 0){
      chatContent += `
        ${chatContent !== '' ? '<hr>': ''}<b>${actor.name} is Downed!</b><br>
        <div>
        They gain 3 Wounds and must roll on the Injury Table. Their allies must perform a Morale Test.
        Furthermore, any clothing they were wearing is ruined and must be repaired or it will have -1 Splendor!
        </div>
        <div>
          <button class="injury-btn" data-actor-id="${actor.id}" data-injury-type="major">Major Injury</button>
         </div>
        `
      if(newHp <= actor.system.derived.tempHp.max * -1){
        chatContent += `
          <br><b>Instant Death!</b>
          <div>${actor.name} must succeed a <b>Hard (-20) Endurance Test</b> or immediately die.</div>
        `
      }
    }
    let chatData = {
      content: chatContent,
      user: game.user._id,
    };
    if(chatContent !== '' && !messageId)
      ChatMessage.create(chatData, {});
    else {
      const message = game.messages.get(messageId);
      message.update({content: message.content + chatContent})
    }

    actor.update({
      [`system.derived.hp.value`]: newHp,
      [`system.derived.tempHp.value`]: newTempHp,
    })
    if(macro) {
      result["messageId"] = messageId
      result["inflictedDamage"] = damageTaken
      const macrosToFire = UtilsTPO.getMacrosByTrigger("afterDamage", macro)
      macrosToFire.forEach(m => {
        UtilsTPO.fireMacro("after-applying-damage", m.type, m.script, {result: result})
      })
    }
  }

  static generateInjury(isMinorInjury){
    //Roll 1d100, -40 mod if minor injury
    //look up value on contants array
    //use result to build effect
    //return effect
  }

  static getMacrosByTrigger(trigger, macros) {
    if(macros)
      return macros.filter(macro => macro.trigger === trigger)
    return []
  }

  static async fireMacro(name, type, script, args = {}) {
    const macro = await Macro.create({
      name: `${name}-tpo-fired-generated`,
      type: type,
      command: script,
      flags: { "tpo.rollMacro": true }
    });

    const macroResult = await macro.execute(args);
    macro.delete();
    return macroResult;
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

      if(prevCombatant?.actor?.system?.rechargePowers.length > 0){
        let potentialRechargedPowers = '';
        let notCharged = '';
        const roll = new Roll('1d100').roll({async: false}).total
        prevCombatant.actor.system.rechargePowers.forEach(pwr => {
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
    let delayedPowers = ``
    if(combatant.actor.system.delayedPowers && combatant.actor.system?.delayedPowers.length > 0){
      delayedPowers = `
        <hr>
        <div>${combatant.actor.system.name} has the following Delayed Powers:<div>
      `
      const newDelayedPowers = []
      combatant.actor.system?.delayedPowers.forEach(power => {
        power.delayRemaining -= 1;
        const powerItem = combatant.actor.items.get(power.powerId)
        if(power.delayRemaining < 1){
          delayedPowers += `
          <div>
            <b>${powerItem.name}</b> - <button class="delayed-power-btn" data-actor-id="${combatant.actor.id}" data-power-id="${power.powerId}" data-armament-id="${power.armamentId}">Perform Power!</button>
          </div>`
        } else {
          delayedPowers += `<div><br><b>${powerItem.name}</b> - Delay ${power.delayRemaining + 1} → ${power.delayRemaining}</div>`
          newDelayedPowers.push({
            delayRemaining: Number(power.delayRemaining),
            powerId: power.powerId,
            armamentId: power.armamentId
          })
        }
      })
      combatant.actor.update({
        [`system.delayedPowers`]: newDelayedPowers
      })
    }

    let statuses = ``;
    if(combatant.actor.effects.size !== 0){
      statuses = `
        <hr>
        <div>${combatant.actor.name} is under the following effects!<div>
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
        <div>${combatant.actor.name} is under the following effects!<div>
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
      if(!effect.disabled){
        if(effect.name.includes("Bleeding")){
          bleedings.push(effect);
          return;
        }
        if(effect.name.includes("Exhausted")){
          exhausteds.push(effect);
          return;
        }
        if(effect.name.includes("Ongoing")){
          ongoings.push(effect);
          return;
        }
        if(effect.name.includes("Paralyzed")){
          paralyzeds.push(effect);
          return;
        }
        if(effect.name.includes("Hampered")){
          hampereds.push(effect);
          return;
        }
  
        let isInjury;
        const injuryLookup = TPO.injuries.filter(s => {
          return game.i18n.format(s.label) === effect.name;
        });
        isInjury = injuryLookup.length !== 0
  
  
        const description = effect.description === "" ? "No Description." : effect.description;
        if(effect.isTemporary && (Number.isNumeric(effect.duration.remaining) && (effect.duration.remaining <= 0))) {
          statuses += `
          <br>
          <b>${effect.name} Ended!</b>
          <div style="display:flex;">
            <img style="width:40px;height:40px;border:none;filter: drop-shadow(0px 0px 7px black);" src="${effect.icon}" alt="${effect.name}">
            <div style="margin:0;margin-left:4px;align-self:flex-start">${description}</div>
          </div>
          `
          combatant.actor.effects.get(effect.id).delete()
        } else {
          statuses += `
          <br>
          <b>${effect.name}</b>
          <div style="display:flex;">
            <img style="width:40px;height:40px;border:none;filter: drop-shadow(0px 0px 7px black);" src="${effect.icon}" alt="${effect.name}">
            <div style="margin:0;margin-left:4px;align-self:flex-start">${description}</div>
          </div>
        `
        }
      }
    });

    if(bleedings.length > 0) statuses += UtilsTPO.formatRatingStatus(bleedings, combatant);
    if(exhausteds.length > 0) statuses += UtilsTPO.formatRatingStatus(exhausteds, combatant);
    if(ongoings.length > 0) statuses += UtilsTPO.formatRatingStatus(ongoings, combatant);
    if(paralyzeds.length > 0) statuses += UtilsTPO.formatRatingStatus(paralyzeds, combatant);
    if(hampereds.length > 0) statuses += UtilsTPO.formatRatingStatus(hampereds, combatant);

    const overencumbered = combatant.actor.system.derived.encumbrance.overencumbered
    if(overencumbered > 0){
      let description = 'Movement is reduced by 1sq.'
      if(overencumbered > 4)
        description = 'Cannot move.<br>Disadvantage on all physical actions.'
      else if (overencumbered > 2)
        description = 'Movement reduced by 2sq.<br>Disadvantage on all physical actions'

      statuses += `
        <br>
        <b>Overencumbered ${overencumbered}</b>
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
      if(auldlonder.system.level > 1 && combat.current.round > 1){
        abilities += `
        <br><b>${game.i18n.format("SPECIES.Auldlonder")} - Persistence</b><br>
        <div>${game.i18n.format("ABILITY.Persistance2")}</div>
        `
        combatant.actor.update({"data.derived.movement.value": combatant.actor.system.derived.movement.value + 1})
      }else if (auldlonder.system.level > 0 && combat.current.round > 2){
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
        ${delayedPowers}
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

  static getActor(actorId) {
    if(actorId.isToken)
      return canvas.scene.tokens.get(actorId.id).actor
    else
      return game.actors.get(actorId.id)
  }

  static getMessageContext(messageId) {
    const message = game.messages.get(messageId)
    if(message)
      return message.getFlag('tpo', 'context')
    else 
      return false;
  }

  static expandPopout(event) {
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

  static async inflictEffectSend(uuid, effect) {
    console.log("sent")
    if(game.user.isGM){
      UtilsTPO.inflictEffectRecieve({
        uuid: uuid,
        effect: effect,
        sender: game.user
      })
    } else {
      await game.socket.emit('system.tpo', {type: "inflictEffect", data: {
        uuid: uuid,
        effect: effect,
        sender: game.user
      }});
    }
  }

  static async inflictEffectRecieve(data) {
    if(!game.user.isGM) 
      return;

    const target = await fromUuid(data.uuid)

    new Dialog({
      title: `Inflict ${data.effect.name} on ${target.name}`,
      content:`
        <form>
          <div class="form-group">
            Allow ${data.sender.name} to inflict the following effect on ${target.name}?
          </div>
          <h2>${data.effect.name}</h2>
          <div>${data.effect.description}</div>
        </form>`,
      buttons:{
        yes: {
          icon: "<i class='fas fa-check'></i>",
          label: `Yes`,
          callback: html => {
            target.createEmbeddedDocuments("ActiveEffect", [data.effect])
          }
        },
        no: {
          icon: "<i class='fas fa-cancel'></i>",
          label: `No`
        }}, 
    }).render(true);
  }

  static async inflictDamageSend(uuid, rawDamage, elementalDamage, element, piercing) {
    if(game.user.isGM){
      UtilsTPO.inflictDamageRecieve({
        uuid: uuid,
        rawDamage: rawDamage,
        elementalDamage: elementalDamage,
        element: element,
        piercing: piercing,
        sender: game.user
      })
    } else {
      await game.socket.emit('system.tpo', {type: "inflictDamage", data: {
        uuid: uuid,
        rawDamage: rawDamage,
        elementalDamage: elementalDamage,
        element: element,
        piercing: piercing,
        sender: game.user
      }});
    }
  }

  static async inflictDamageRecieve(data) {
    if(!game.user.isGM) 
      return;

    const target = await fromUuid(data.uuid)

    new Dialog({
      title: `Inflict Damage to ${target.name}`,
      content:`
        <form>
          <div class="form-group">
            Allow ${data.sender.name} to inflict ${data.rawDamage} Raw, ${data.elementalDamage} ${data.element} ${data.piercing ? " <b>Piercing</b>" : ""} Damage to ${target.name}?
          </div>
        </form>`,
      buttons:{
        yes: {
          icon: "<i class='fas fa-check'></i>",
          label: `Yes`,
          callback: () => {
            let elementDamage = 0;
            if(target.system.details.elementalResistances[data.element] == 'W'){
              elementDamage = data.elementalDamage * 2;
            } else if(target.system.details.elementalResistances[data.element] == 'S'){
              elementDamage = Math.floor(data.elementalDamage * 0.5);
            }

            const totalDamage = data.rawDamage + elementDamage >= 0 ? data.rawDamage + elementDamage : 0
        
            UtilsTPO.applyDamage(
              data.uuid,
              [totalDamage],
              data.piercing,
              null,
              null,
              {},
              true
            )
          }
        },
        no: {
          icon: "<i class='fas fa-cancel'></i>",
          label: `No`
        }}, 
    }).render(true);
  }
}