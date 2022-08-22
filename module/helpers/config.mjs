export const TPO = {};

// Define constants here, such as:
TPO.foobar = {
  'bas': 'TPO.bas',
  'bar': 'TPO.bar'
};

TPO.statuses = [
  {
    id: "halfablaze",
    label: "STATUS.HalfAblaze",
    icon: "systems/tpo/module/assets/halfablaze.png",
    description: "No effect... yet."
  },
  {
    id: "ablaze",
    label: "STATUS.Ablaze",
    icon: "icons/svg/fire.svg",
    description: "You have been set on fire, which is quite unpleasant.<br>At the start of your turn, you must make a Morale Test, and then take 1d10 damage.<br><br>This status lasts until you succeed a<b>Difficult (-10) Athletics Test</b> at the end of your turn."
  },
  {
    id: "halfblinded",
    label: "STATUS.HalfBlinded",
    icon: "systems/tpo/module/assets/halfblinded.png",
    description: "No effect... yet."
  },
  {
    id: "blinded",
    label: "STATUS.Blinded",
    icon: "icons/svg/blind.svg",
    description: "You cannot see, being blinded by some means.<br>You have Disadvantage when defending against attacks, and when making Melee Attacks. If you’re performing a ranged attack, you have 2 Disadvantages.<br><br>This status will last until what is obscuring your vision is removed, or if it is some irritant in your eye, until you succeed a <b>Challenging (+0) Endurance Test</b>."
  },
  {
    id: "halfpanicking",
    label: "STATUS.HalfPanicking",
    icon: "systems/tpo/module/assets/halfpanicking.png",
    description: "No effect... yet."
  },
  {
    id: "panicking",
    label: "STATUS.Panicking",
    icon: "icons/svg/terror.svg",
    description: "You are panicking, unable to think straight, and convinced that death has come a-knocking. You must use your AP to get yourself as far away from danger as you can on your turn, fleeing without taking any time to Disengage. You suffer Disadvantage on all Tests not related to running and hiding.<br><br>This status lasts until you can either spend a round out of sight from any danger or you succeed a <b>Challenging (+0) Cool Test</b> at the end of your turn, provided you were not engaged at the start of your turn."
  },
  {
    id: "halfprone",
    label: "STATUS.HalfProne",
    icon: "systems/tpo/module/assets/halfprone.png",
    description: "No effect... yet."
  },
  {
    id: "prone",
    label: "STATUS.Prone",
    icon: "icons/svg/falling.svg",
    description: "You’ve either laid down intentionally or been knocked to the ground. Melee attacks targeting you have Advantage. Any melee attack you make has Disadvantage. Ranged attacks targeting you have Disadvantage. Movement Costs are doubled.<br><br>You can stand with 1 AP."
  },
  {
    id: "halfslowed",
    label: "STATUS.HalfSlowed",
    icon: "systems/tpo/module/assets/halfslowed.png",
    description: "No effect... yet."
  },
  {
    id: "slowed",
    label: "STATUS.Slowed",
    icon: "icons/svg/anchor.svg",
    description: "The AP cost of taking the Move Action is increased by 1 AP. <br><br>This status lasts until you succeed a <b>Hard (-20) Might Test</b> at the end of your turn."
  },
  {
    id: "halfstunned",
    label: "STATUS.HalfStunned",
    icon: "systems/tpo/module/assets/halfstunned.png",
    description: "No effect... yet."
  },
  {
    id: "stunned",
    label: "STATUS.Stunned",
    icon: "icons/svg/daze.svg",
    description: "A heavy blow has disoriented you or you are otherwise dazed and confused. The AP cost of taking the Move Action is increased by 1 AP. You have Disadvantage on all rolls.<br><br>This status lasts until you succeed a <b>Challenging (+0) Endurance Test</b> at the end of your turn."
  },
  {
    id: "halfunconcious",
    label: "STATUS.HalfUnconcious",
    icon: "systems/tpo/module/assets/halfunconcious.png",
    description: "No effect... yet."
  },
  {
    id: "unconcious",
    label: "STATUS.Unconcious",
    icon: "icons/svg/sleep.svg",
    description: "You cannot move, perform any action, and you cannot oppose any roll. If you are Downed, you can still make tests to Stabilize, however. The first attack made against you automatically crits and deals 2x damage.<br><br>You will wake up after succeeding 2 <b>Challenging (+0) Endurance Tests</b> or upon taking damage, provided you are not Downed."
  },
  {
    id: "halfweakened",
    label: "STATUS.HalfWeakened",
    icon: "systems/tpo/module/assets/halfweakened.png",
    description: "No effect... yet."
  },
  {
    id: "weakened",
    label: "STATUS.Weakened",
    icon: "icons/svg/downgrade.svg",
    description: "For the duration of this status, treat your Absorption as if it were 0 when determining damage.<br><br>This status lasts until you succeed a <b>Difficult (-10)Endurance Test</b> at the end of your turn."
  },
  {
    id: "halfbleeding",
    label: "STATUS.HalfBleeding",
    icon: "systems/tpo/module/assets/halfbleeding.png",
    description: "No effect... yet."
  },
  {
    id: "bleeding1",
    label: "STATUS.Bleeding1",
    icon: "systems/tpo/module/assets/bleeding1.png",
    description: "You are bleeding quite badly. You take REPLACE damage at the end of your turn and take REPLACE points of damage for every square moved on your turn. <br><br>This status lasts until you succeed a <b>Challenging (+0) Heal Test</b> at the end of your turn or use a bandage."
  },
  {
    id: "bleeding2",
    label: "STATUS.Bleeding2",
    icon: "systems/tpo/module/assets/bleeding2.png",
    description: "You are bleeding quite badly. You take REPLACE damage at the end of your turn and take REPLACE points of damage for every square moved on your turn. <br><br>This status lasts until you succeed a <b>Challenging (+0) Heal Test</b> at the end of your turn or use a bandage."
  },
  {
    id: "bleeding3",
    label: "STATUS.Bleeding3",
    icon: "systems/tpo/module/assets/bleeding3.png",
    description: "You are bleeding quite badly. You take REPLACE damage at the end of your turn and take REPLACE points of damage for every square moved on your turn. <br><br>This status lasts until you succeed a <b>Challenging (+0) Heal Test</b> at the end of your turn or use a bandage."
  },
  {
    id: "halfexhausted",
    label: "STATUS.HalfExhausted",
    icon: "systems/tpo/module/assets/halfexhausted.png",
    description: "No effect... yet."
  },
  {
    id: "exhausted1",
    label: "STATUS.Exhausted1",
    icon: "systems/tpo/module/assets/exhausted1.png",
    description: "You are extremely tired. It is hard to effectively think and move. While you are exhausted, you suffer REPLACE Disadvantage(s) on all Tests. After you get an Exhausted Status, each subsequent Exhausted half-status you acquire increases the Rating by 1. If the Rating reaches 10, you die.<br><br>A full day’s rest in a safe location with food and drink subtracts 1 from its rating."
  },
  {
    id: "exhausted2",
    label: "STATUS.Exhausted2",
    icon: "systems/tpo/module/assets/exhausted2.png",
    description: "You are extremely tired. It is hard to effectively think and move. While you are exhausted, you suffer REPLACE Disadvantage(s) on all Tests. After you get an Exhausted Status, each subsequent Exhausted half-status you acquire increases the Rating by 1. If the Rating reaches 10, you die.<br><br>A full day’s rest in a safe location with food and drink subtracts 1 from its rating."
  },
  {
    id: "exhausted3",
    label: "STATUS.Exhausted3",
    icon: "systems/tpo/module/assets/exhausted3.png",
    description: "You are extremely tired. It is hard to effectively think and move. While you are exhausted, you suffer REPLACE Disadvantage(s) on all Tests. After you get an Exhausted Status, each subsequent Exhausted half-status you acquire increases the Rating by 1. If the Rating reaches 10, you die.<br><br>A full day’s rest in a safe location with food and drink subtracts 1 from its rating."
  },
  {
    id: "halfongoing",
    label: "STATUS.HalfOngoingDamage",
    icon: "systems/tpo/module/assets/halfongoing.png",
    description: "No effect... yet."
  },
  {
    id: "ongoing1",
    label: "STATUS.OngoingDamage1",
    icon: "systems/tpo/module/assets/ongoing1.png",
    description: "Something is steadily harming you, be it poison, an open wound, or something else. Take REPLACE damage at the end of your turn. <br><br>After you take the damage, you may attempt a <b>Challenging (+0) Endurance Test</b>, reducing the Rating by SLs scored, to a minimum of 0. Once the Rating is reduced to 0, the status ends. Unless otherwise specified, the test is an Endurance Test"
  },
  {
    id: "ongoing2",
    label: "STATUS.OngoingDamage2",
    icon: "systems/tpo/module/assets/ongoing2.png",
    description: "Something is steadily harming you, be it poison, an open wound, or something else. Take REPLACE damage at the end of your turn. <br><br>After you take the damage, you may attempt a <b>Challenging (+0) Endurance Test</b>, reducing the Rating by SLs scored, to a minimum of 0. Once the Rating is reduced to 0, the status ends. Unless otherwise specified, the test is an Endurance Test"
  },
  {
    id: "ongoing3",
    label: "STATUS.OngoingDamage3",
    icon: "systems/tpo/module/assets/ongoing3.png",
    description: "Something is steadily harming you, be it poison, an open wound, or something else. Take REPLACE damage at the end of your turn. <br><br>After you take the damage, you may attempt a <b>Challenging (+0) Endurance Test</b>, reducing the Rating by SLs scored, to a minimum of 0. Once the Rating is reduced to 0, the status ends. Unless otherwise specified, the test is an Endurance Test"
  },
  {
    id: "halfparalyzed",
    label: "STATUS.HalfParalyzed",
    icon: "systems/tpo/module/assets/halfparalyzed.png",
    description: "No effect... yet."
  },
  {
    id: "paralyzed1",
    label: "STATUS.Paralyzed1",
    icon: "systems/tpo/module/assets/paralyzed1.png",
    description: "Your limbs are getting heavier and heavier, and you are finding it increasingly hard to move. Reduce your AP by REPLACE, if the REPLACE exceeds your AP, gain a Prone Status as you fall to the floor, completely rigid."
  },
  {
    id: "paralyzed2",
    label: "STATUS.Paralyzed2",
    icon: "systems/tpo/module/assets/paralyzed2.png",
    description: "Your limbs are getting heavier and heavier, and you are finding it increasingly hard to move. Reduce your AP by REPLACE, if the REPLACE exceeds your AP, gain a Prone Status as you fall to the floor, completely rigid."
  },
  {
    id: "paralyzed3",
    label: "STATUS.Paralyzed3",
    icon: "systems/tpo/module/assets/paralyzed3.png",
    description: "Your limbs are getting heavier and heavier, and you are finding it increasingly hard to move. Reduce your AP by REPLACE, if the REPLACE exceeds your AP, gain a Prone Status as you fall to the floor, completely rigid."
  },
  {
    id: "marked",
    label: "STATUS.Marked",
    icon: "icons/svg/target.svg",
    description: "A creature has marked you. The effects of which depend on what power marked you."
  },
  {
    id: "downed",
    label: "STATUS.Downed",
    icon: "icons/svg/down.svg",
    description: "You’ve been knocked below 0 hit points and are on death’s door. While you are Downed, you are drifting in and out of consciousness, trying to stay alive. You also have the Prone and Unconscious Statuses. These statuses cannot be removeduntil you gain at least 1 HP or have Stabilized.<br>To prevent yourself from dying, you must make either a <b>Difficult (-10) Endurance Test</b> or a <b>Demanding (+10) Heal Test</b> on your turn within 3 rounds of being downed. If you succeed in one of these tests before you run out of time, you Stabilize, no longer being at risk of dying. If 3 rounds pass before a successful test, your Character dies, bleeding out."
  },
  {
    id: "stabilized",
    label: "STATUS.Stabilized",
    icon: "icons/svg/unconscious.svg",
    description: "If you are Stabilized, you remain Downed until you get at least 20SL on an <b>Extended Challenging (+0) Endurance Test</b> or an <b>Extended Average (+20) Heal Test</b>, after which you drift back into consciousness with 1 HP and the Prone Status. You can make these tests on your turn during combat."
  },
  {
    id: "dead",
    label: "STATUS.Dead",
    icon: "icons/svg/skull.svg",
    description: "You're dead bruh."
  },
]