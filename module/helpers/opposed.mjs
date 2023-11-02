import { DiceTPO, UtilsTPO } from "./utilities.mjs";
export class OpposedTPO {
  constructor(data = {}) {
    this.data = {
      messageId: data.messageId,
      attackerMessageId: data.attackerMessageId,
      defenderMessageId: data.defenderMessageId,
      defenders: {},
      resultMessageId: data.resultMessageId,
      unopposed: data.unopposed
    }
  }

  static async startOpposedTest(attackerMessageId){
    //get targets
    const targetNames = []
    const targetIds = []
    game.user.targets.forEach((target) => {
      targetNames.push(target.name)
      targetIds.push({
        isToken: !target.document.actorLink,
        id: target.document.actorLink ? target.document.actorId : target.document.id,
      })
    })

    const attackerContext = UtilsTPO.getMessageContext(attackerMessageId);
    const attacker = UtilsTPO.getActor(attackerContext.actorId).name

    //create opposed card w/ attacker and defender if applicable
    const content = `
      <b> ${attackerContext.result.length > 1 ? `${attackerContext.result.length} ` : ''}Opposed Test${attackerContext.result.length > 1 ? 's' : ''} </b><br>
      Initiator: ${attacker}<br>
      Target${targetNames > 0 ? 's' : '' }: ${targetNames.join(', ')} <i class="unopposed-tst rollable fad fa-exchange-alt" style="float:right;" data-tooltip="Resolve as Unopposed"></i>
    `
    const chatData = {
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      content: content
    };
    const message = await ChatMessage.create(chatData, {});
    await message.setFlag('tpo', 'context', {
      attackerMessageId: attackerMessageId,
      targets: targetIds
    })
    let socketTargets = []
    game.user.targets.forEach(async (target) => {
      targetIds.push({
        isToken: !target.document.actorLink,
        id: target.document.actorLink ? target.document.actorId : target.document.id,
      })

      //set flag for defender to this message id
      if(target.isOwner){
        const newOpposed = {
          id: message.id,
          numTests: attackerContext.result.length,
        }
        const existingOpposed = await target.actor.getFlag('tpo', 'opposed')
        const opposedArray = existingOpposed ? [...existingOpposed, newOpposed] : [newOpposed]
        target.actor.setFlag('tpo', 'opposed', opposedArray)
      } else {
        socketTargets.push({
          defenderId: {
            isToken: !target.document.actorLink,
            id: target.document.actorLink ? target.document.actorId : target.document.id,
          }, 
          messageId: message.id,
          numResults: attackerContext.result.length
        })
      }
    })
    if(socketTargets.length > 0){
      await game.socket.emit('system.tpo', {type: "opposedTarget", data: socketTargets} );
    }
    game.user.updateTokenTargets([]);
  }

  static async defenderRoll(defenderMessageId, defenderId){
    const defender = UtilsTPO.getActor(defenderId);
    const opposedTests = defender.getFlag('tpo', 'opposed')
    let opposedTest;
    let opposedContext;
    
    do {
      opposedTest = opposedTests.shift()
      console.log(opposedTest)
      if(opposedTest?.id)
        opposedContext = UtilsTPO.getMessageContext(opposedTest.id)
      else
        opposedContext = false;
      console.log(opposedContext)
    } while (opposedTests.length > 0 && opposedContext === false);

    if (!opposedContext) {
      console.warn("TPO | No matching mesages for opposed test!")
      return;
    }

    const defenderContext = UtilsTPO.getMessageContext(defenderMessageId)
    const attackerContext = UtilsTPO.getMessageContext(opposedContext.attackerMessageId)

    if(!defenderContext || !attackerContext) {
      console.warn("TPO | Missing attacker or defender message!")
      return;
    }

    const attacker = UtilsTPO.getActor(attackerContext.actorId);

    const resultKey = opposedTest.numTests > 1 ? opposedTest.numTests - 1 : 0

    const attackerSls = attackerContext.result[resultKey].sl - defenderContext.result[0].sl;
    let attackerWin = attackerSls > 0;
    if(attackerSls === 0)
      if(attackerContext.result[resultKey].success === defenderContext.result[0].success)
        attackerWin = attackerContext.result[resultKey].roll < defenderContext.result[0].roll
      else
        attackerWin = attackerContext.result[resultKey].success

    let damageString = ``;
    let damage = 0;
    if(attackerContext.result[resultKey].damage.hasDamage && attackerWin){
      const calculatedDamage = OpposedTPO.calculateDamage(
        attackerContext.result[resultKey], 
        defender.system.details.elementalResistances,
        defenderContext.result[0].sl
      )

      damageString = calculatedDamage.damageString
      damage = calculatedDamage.damage
    }

    let remainingOpposed = resultKey;
    opposedTests.forEach(test => {
      remainingOpposed += test.numTests
    })

    let content = `
        <b>${attacker.name} vs ${defender.name}</b><br>
        ${this.generateChatContent(
          attacker.name, 
          defender.name, 
          attackerWin, 
          attackerContext.result[resultKey].sl, 
          defenderContext.result[0].sl, 
          attackerSls, 
          remainingOpposed, 
          true
        )}
        ${damageString}
      `

    let chatData = {
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      content: content
    };
    const message = await ChatMessage.create(chatData, {});
    await message.setFlag('tpo', 'context', {
      opposedTest: true,
      damage: attackerWin ? [damage] : [],
      defenderId: defenderId,
    })
    if(resultKey > 0){
      opposedTest.numTests = resultKey;
      defender.setFlag('tpo', 'opposed', [opposedTest, ...opposedTests])
    } else
      defender.setFlag('tpo', 'opposed', [...opposedTests])
  }

  static async unopposedTest(messageId){
    const opposedContext = UtilsTPO.getMessageContext(messageId);

    opposedContext.targets.forEach(async defenderId => {
      const defender = UtilsTPO.getActor(defenderId);
      const attackerContext = UtilsTPO.getMessageContext(opposedContext.attackerMessageId)
      const numTests = defender.getFlag('tpo', 'opposed').filter(test =>  {return test.id === messageId})[0].numTests - 1
      const opposedTests = defender.getFlag('tpo', 'opposed').filter(test =>  {return test.id !== messageId})
      defender.setFlag('tpo', 'opposed', [...opposedTests])
      if(!attackerContext) {
        console.warn("TPO | Missing attacker message!")
        return;
      }
      const attacker = UtilsTPO.getActor(attackerContext.actorId);
      let content = `<b>${attacker.name} vs ${defender.name}</b><br>`;
      let totalDamage = []

      for (let i = numTests; i >= 0; i--){
        const result = attackerContext.result[i]
        console.log(result)
        const attackerSls = result.sl;
        let attackerWin = result.success;

        let damageString = ``;
        let damage = 0;
        if(result.damage.hasDamage && attackerWin){
          const calculatedDamage = OpposedTPO.calculateDamage(
            result, 
            defender.system.details.elementalResistances,
            0
          )

          damageString = calculatedDamage.damageString
          damage = calculatedDamage.damage
          totalDamage.push(damage)
        }

        content += `
          ${this.generateChatContent(
            attacker.name,
            defender.name,
            attackerWin,
            result.sl,
            0,
            attackerSls,
            0,
            true)}
          ${damageString}
        `
      }

      let remainingOpposed = 0;
      opposedTests.forEach(test => {
        remainingOpposed += test.numTests
      })

      content += `${remainingOpposed > 0 ? `<br>${defender.name} has ${remainingOpposed} opposed test${remainingOpposed > 1 ? 's' : ''} still to resolve.` : ``}`

      let chatData = {
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(),
        content: content
      };
      const message = await ChatMessage.create(chatData, {});
      await message.setFlag('tpo', 'context', {
        opposedTest: true,
        damage: totalDamage,
        defenderId: defenderId,
      })
    })
  }

  static generateChatContent(attackerName, defenderName, attackerWin, attackerSls, defenderSls, resultSls, remainingOpposed, opposed = false) {
    return `
      <hr>
      <h3> ${attackerWin ? `${attackerName} Wins` : `${defenderName} Wins`}</h3>
      <b>SLs:</b><br>${attackerName}: ${attackerSls} <br> ${opposed ? `${defenderName}: ${defenderSls}` : ` ${defenderName}: Did not contest.`}<br>
      <hr>
      <b>Result: ${resultSls} SLs - ${DiceTPO.getTestResults(resultSls, attackerWin)}</b>
      ${remainingOpposed > 0 ? `<br>${defenderName} has ${remainingOpposed} opposed test${remainingOpposed > 1 ? 's' : ''} still to resolve.` : ``}
    `
  }

  static calculateDamage(result, defenderResistances, defenderSls) {
    const raw = result.damage.raw;
    let elementDamage = result.damage.elementDamage;
    let element;
    if(result.damage.element.includes('fire'))
      element = 'fire'
    if(result.damage.element.includes('bolt'))
      element = 'elec'
    if(result.damage.element.includes('dragon'))
      element = 'dragon'
    if(result.damage.element.includes('snowflake'))
      element = 'ice'
    if(result.damage.element.includes('tint'))
      element = 'water'
    

    let elementStr = ''
    if(defenderResistances[element] == 'W'){
      elementDamage = elementDamage * 2;
      elementStr =`
        <b style="color:#51632C">
          ${raw - defenderSls + elementDamage} (Vulnerable)
        </b>`
    } else if(defenderResistances[element] == 'S'){
      elementDamage = Math.floor(elementDamage * 0.5);
      elementStr =`
      <b style="color:#642422">
        ${raw - defenderSls + elementDamage} (Resists)
      </b>`
    } else {
      elementStr =`
        <b>
          ${raw - defenderSls + elementDamage} (Neutral)
        </b>`
    }

    const damageString = `
    <br><b>Damage:</b>
        <div style="display:flex;gap: 3px; text-align:center;">
          <span>
            <i class="fas fa-fist-raised" data-tooltip="Raw"></i> ${raw - defenderSls}
          </span>
          &nbsp+&nbsp 
          <span>
            ${result.damage.element}${elementDamage}
          </span>
          &nbsp=&nbsp
          ${elementStr}
        </div>
      `
    const totalDamage = raw - defenderSls + elementDamage > 0 ? raw - defenderSls + elementDamage : 1
    return {damageString: damageString, damage: totalDamage}
  }

  static opposedTarget(data) {
    data.forEach(async datum => {
      const defender = UtilsTPO.getActor(datum.defenderId)
      const newOpposed = {
        id: message.id,
        numTests: attackerContext.result.length,
      }
      const existingOpposed = await defender.getFlag('tpo', 'opposed')
      const opposedArray = existingOpposed ? [...existingOpposed, newOpposed] : [newOpposed]
      await defender.setFlag('tpo', 'opposed', opposedArray)
    })
  }
}