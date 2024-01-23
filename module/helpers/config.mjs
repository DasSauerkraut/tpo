export const TPO = {};

// Define constants here, such as:
TPO.statuses = [
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
    id: "halfhampered",
    label: "STATUS.HalfHampered",
    icon: "systems/tpo/module/assets/halfhampered.png",
    description: "No effect... yet."
  },
  {
    id: "hampered1",
    label: "STATUS.Hampered1",
    icon: "systems/tpo/module/assets/hampered1.png",
    description: "Something is preventing you from properly using your weapon. Reduce all Damage you deal by REPLACE. At the end of your turn, you may attempt a Challenging (+0) Endurance Test, reducing the Rating by SLs scored, to a minimum of 0. Once the Rating is reduced to 0, the status ends. Unless otherwise specified, the test is an Endurance Test."
  },
  {
    id: "hampered2",
    label: "STATUS.Hampered2",
    icon: "systems/tpo/module/assets/hampered2.png",
    description: "Something is preventing you from properly using your weapon. Reduce all Damage you deal by REPLACE. At the end of your turn, you may attempt a Challenging (+0) Endurance Test, reducing the Rating by SLs scored, to a minimum of 0. Once the Rating is reduced to 0, the status ends. Unless otherwise specified, the test is an Endurance Test."
  },
  {
    id: "hampered3",
    label: "STATUS.Hampered3",
    icon: "systems/tpo/module/assets/hampered3.png",
    description: "Something is preventing you from properly using your weapon. Reduce all Damage you deal by REPLACE. At the end of your turn, you may attempt a Challenging (+0) Endurance Test, reducing the Rating by SLs scored, to a minimum of 0. Once the Rating is reduced to 0, the status ends. Unless otherwise specified, the test is an Endurance Test."
  },
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
    description: "The Difficulty of all Dodge, Weapon, and Cool Tests in increased by one step. If you fail a Morale Test while you have a Wavering Status, gain a Panicking Status. <br>An ally can remove this status from you by spending 1 AP and succeeding a <b>Challenging (+0) Leadership Test</b>."
  },
  {
    id: "panicking",
    label: "STATUS.Panicking",
    icon: "icons/svg/terror.svg",
    description: "You are panicking, unable to think straight, and convinced that death has come a-knocking. You must use your AP to get yourself as far away from danger as you can on your turn, fleeing without taking any time to Disengage. You suffer Disadvantage on all Tests not related to running and hiding.<br><br>This status lasts until you can either spend a round out of sight from any danger or you succeed a <b>Challenging (+0) Cool Test</b> at the end of your turn, provided you were not engaged at the start of your turn.<br>An ally can remove this status from you by spending 1 AP and succeeding a <b>Challenging (+0) Leadership Test</b>."
  },
  {
    id: "halfrattled",
    label: "STATUS.HalfRattled",
    icon: "systems/tpo/module/assets/halfrattled.png",
    description: "No effect... yet."
  },
  {
    id: "rattled",
    label: "STATUS.Rattled",
    icon: "icons/svg/explosion.svg",
    description: "You have been struck asides the head with heavy blow. The Difficulty of all tests is increased by one step. This status lasts until you succeed a <b>Challenging (+0) Endurance Test</b> at the end of your turn."
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
    id: "singed",
    label: "BURN.Singed",
    icon: "systems/tpo/module/assets/singed.png",
    description: "At the start of this creatures turn, it takes its 3 Piercing Damage. If the creature is Large, it takes 5 Piercing Damage instead."
  },
  {
    id: "shocked",
    label: "BURN.Shocked",
    icon: "systems/tpo/module/assets/shocked.png",
    description: "The next attack this creature makes has Disadvantage."
  },
  {
    id: "harrowed",
    label: "BURN.Harrowed",
    icon: "systems/tpo/module/assets/harrowed.png",
    description: "+1 Movement. The next instance of damage this creature suffers ignores Absorption."
  },
  {
    id: "frozen",
    label: "BURN.Frozen",
    icon: "systems/tpo/module/assets/frozen.png",
    description: "The next Defend action this creature takes has Disadvantage."
  },
  {
    id: "drenched",
    label: "BURN.Drenched",
    icon: "systems/tpo/module/assets/drenched.png",
    description: "-1 Movement. This creature becomes Vulnerable to Electric and Ice."
  },
  {
    id: "marked",
    label: "STATUS.Marked",
    icon: "icons/svg/target.svg",
    description: "A creature has marked you. The effects of which depend on what power marked you."
  },
  {
    id: "hidden",
    label: "STATUS.Hidden",
    icon: "icons/svg/invisible.svg",
    description: "You are hidden from the sight of your enemies. You have Advantage on all attacks and Grapple Tests, though the first attack or grapple you perform makes you no longer hidden. While Hidden, perform a Challenging (+0) Stealth Test at the start of your turn. Any time you cross in front of an enemy’s line of sight, or move within 2sq. of an enemy, they must perform a Challenging (+0) Perception Test. If your Stealth Test’s SLs are higher than their perception test’s, you remain Hidden, otherwise you are spotted and are no longer Hidden."
  },
  {
    id: "prone",
    label: "STATUS.Prone",
    icon: "icons/svg/falling.svg",
    description: "You’ve either laid down intentionally or been knocked to the ground. Melee attacks targeting you have Advantage. Any melee attack you make has Disadvantage. Ranged attacks targeting you have Disadvantage. Movement Costs are doubled.<br><br>You can stand with 1 AP."
  },
  {
    id: "downed",
    label: "STATUS.Downed",
    icon: "icons/svg/down.svg",
    description: "You’ve been knocked below 0 hit points and are on death’s door. While you are Downed, you are drifting in and out of consciousness, trying to stay alive. You also have the Prone and Unconscious Statuses. These statuses cannot be removed until you gain at least 1 HP or have Stabilized. To prevent yourself from dying, you must perform an Extended Hard (-20) Endurance Test or Extended Difficult (-10) Heal Test with a target number equal to your Wounds. If ConB rounds pass before succeeding the Extended Test, your Character dies, succumbing to their wounds. You can make a Test for this on your turn during Combat."
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

TPO.injuries = [
  {
    label: "INJURY.FashionableScar",
    icon: "icons/skills/wounds/blood-spurt-spray-red.webp",
    description: "A dramatic cut along forehead or nose that should scar up nicely. Gain a Bleeding 1 Status. Once the wound has healed up, in an appropriate context, you can gain Advantage on a social roll, you can only do this once per encounter"
  },
  {
    label: "INJURY.StunningBlow",
    icon: "icons/skills/wounds/blood-spurt-spray-red.webp",
    description: "Gain a Stunned and Prone status as you are knocked to the ground"
  },
  {
    label: "INJURY.FleshWound",
    icon: "icons/skills/wounds/blood-spurt-spray-red.webp",
    description: "Take Ongoing Damage 4"
  },
  {
    label: "INJURY.LightsOut",
    icon: "icons/skills/wounds/blood-spurt-spray-red.webp",
    description: "Gain an Unconscious and Prone status, suffering 1d10 damage as you collapse to the floor"
  },
  {
    label: "INJURY.NastyGash",
    icon: "icons/skills/wounds/blood-spurt-spray-red.webp",
    description: "Gain a Bleeding 3 Status and take Ongoing Damage 3 until someone can attempt to staunch the bleeding with a successful Average (+20) Heal Test or Challenging (+0) Intellect Test"
  },
  {
    label: "INJURY.Disorientated",
    icon: "icons/skills/wounds/blood-spurt-spray-red.webp",
    description: "The blow knocks you about, disorientating you. Make a Demanding (+10) Endurance Test, if you fail, immediately make a basic attack directed at the nearest creature, allied or not. Gain a Rattled Status."
  },
  {
    label: "INJURY.BrokenNose",
    icon: "icons/skills/wounds/blood-spurt-spray-red.webp",
    description: "Gain a Stunned Condition. Until healed, suffer Disadvantage on all Charm, Haggle, Intimidation, and Persuasion Tests. This will heal in 20+2d10 days."
  },
  {
    label: "INJURY.BrokeItem",
    icon: "icons/skills/wounds/blood-spurt-spray-red.webp",
    description: "A random item, determined by the GM, breaks, rendering it useless. The item cannot be a Power Slate or Armament"
  },
  {
    label: "INJURY.TornLigament",
    icon: "icons/skills/wounds/blood-spurt-spray-red.webp",
    description: "Your ankle rolls in an unnatural way, tearing the tendons within. Your Movement is halved and suffer a -10 modifier on any rolls involving your feet or movement. This will heal in 30+2d10 days, but a successful Average (+20) Heal Test performed on the same day as the injury can reduce the heal time by 10 days. This can only be done once."
  },
  {
    label: "INJURY.Tinnitus",
    icon: "icons/skills/wounds/blood-spurt-spray-red.webp",
    description: "The force of the strike causes a long-lasting ringing in your ears. Until healed, suffer Disadvantage on all Perception and Intuition tests involving hearing. This will heal in 50+2d10 days"
  },
  {
    label: "INJURY.TornMuscle",
    icon: "icons/skills/wounds/blood-spurt-spray-red.webp",
    description: "Until healed, whenever you perform a test that would require use of your primary arm, suffer Disadvantage on that roll. This will heal in 30+2d10 days."
  },
  {
    label: "INJURY.Infected",
    icon: "icons/skills/wounds/blood-spurt-spray-red.webp",
    description: "While not having an immediate effect, the injury you suffered starts to fester a day after receiving the wound. Every day that passes, your Max HP is reduced by 1 while this Injury persists. Should your Max HP be reduced to 0, you die. Every day, someone may attempt a Difficult (-10) Heal Test or a Very Hard (-40) Intellect Test. After 5 successful Tests, this Injury is healed and your Max HP returns to normal."
  },
  {
    label: "INJURY.GrievousWound",
    icon: "icons/skills/wounds/blood-spurt-spray-red.webp",
    description: " Gain a Bleeding 4 Status and take Ongoing Damage 5. Until this injury heals, whenever you roll on the Injury table, you must roll twice and take the worst result. Healing this wound requires Surgery (Demanding)."
  },
  {
    label: "INJURY.SmashedMouth",
    icon: "icons/skills/wounds/blood-spurt-spray-red.webp",
    description: "The blow crushes your jaw, causing you to lose 1d10 teeth and breaking it. Gain a Stunned Status. Make a Hard (-20) Endurance Test or gain the Unconscious Condition. Until your jaw heals, you can only eat liquids and suffer Disadvantage on all social tests. This will heal in 30+2d10 days, after which you need to make a successful Average (+20) Endurance Test or the bone will set improperly, giving you a permanent -10 to Charisma."
  },
  {
    label: "INJURY.BrokenLimb",
    icon: "icons/skills/wounds/blood-spurt-spray-red.webp",
    description: "A bone in one of your limb’s snaps. To determine the affected limb, refer to the Injured Limb table on the previous page. Until healed, any test that involves the affected limb has 2 Disadvantages. If the affected limb is a leg, your Movement is halved. This injury will heal in 30+1d10 days and unless you succeed an Average (+20) Endurance Test, the bone will set improperly, giving you a permanent -10 to rolls related to that limb."
  },
  {
    label: "INJURY.StabbedEye",
    icon: "icons/skills/wounds/blood-spurt-spray-red.webp",
    description: "The blade slips right into your eye. Gain a Bleeding 6 and Stunned Status that cannot be removed until you receive medical attention. Make an Average (+20) Endurance Test, success means you keep your eye, otherwise it is ruined, permanently blinded by the blow causing you to have Disadvantage on all Perception tests. If you can reach someone who can perform Surgery within a week of having your eye ruined, they may attempt to save you eye with a Surgery (Hard) roll. If the eye is not ruined, normal eyesight will return in 30+2d10 days."
  },
  {
    label: "INJURY.SeveredMuscles",
    icon: "icons/skills/wounds/blood-spurt-spray-red.webp",
    description: "The musculature in one of your limbs is shredded. Refer to the Injured Limb table on the previous page to determine the affected limb. Until healed, any test that involves the affected limb has 2 Disadvantages. This injury will not start to heal until you have received Surgery (Average), after which you will heal 20+1d10 days."
  },
  {
    label: "INJURY.LoseALimb",
    icon: "icons/skills/wounds/blood-spurt-spray-red.webp",
    description: "A limb is cleanly severed. To determine the affected limb, refer to the Injured Limb table on the previous page. You cannot use that limb anymore. If the affected limb is a leg, you cannot take the Dodge action and tests involving your legs will have 2 Disadvantages. If the affected limb is an arm or hand, you will have 2 Disadvantages on all tests requiring the use of both hands. Prosthetics can reduce the penalty of having a missing limb."
  },
  {
    label: "INJURY.InternalBleeding",
    icon: "icons/skills/wounds/blood-spurt-spray-red.webp",
    description: "Gain a Bleeding 4 Status and take Ongoing Damage 2. These cannot be removed as normal, instead they can only be removed with Surgery (Challenging). At the end of each day this Injury persists, perform an Easy (+40) Endurance Test. Failing this test means that you gain an Infected Injury as well."
  },
  {
    label: "INJURY.Decapitated",
    icon: "icons/skills/wounds/blood-spurt-spray-red.webp",
    description: "Your head goes sailing off in a lazy arc. You are dead."
  }
]

TPO.stats = {
  "Rí": {
    "ws": 20,
    "str": 20,
    "con": 20,
    "agi": 20,
    "dex": 20,
    "int": 20,
    "will": 20,
    "cha": 20,
  },
  "Hielan": {
    "ws": 20,
    "str": 20,
    "con": 20,
    "agi": 20,
    "dex": 20,
    "int": 20,
    "will": 20,
    "cha": 20,
  },
  "Daoine": {
    "ws": 20,
    "str": 20,
    "con": 20,
    "agi": 20,
    "dex": 20,
    "int": 20,
    "will": 20,
    "cha": 20,
  },
  "Auldlonder": {
    "ws": 20,
    "str": 20,
    "con": 20,
    "agi": 20,
    "dex": 20,
    "int": 20,
    "will": 20,
    "cha": 20,
  },
  "Slepílidé": {
    "ws": 20,
    "str": 20,
    "con": 30,
    "agi": 10,
    "dex": 20,
    "int": 30,
    "will": 20,
    "cha": 20,
  },
  "Ocnílidé": {
    "ws": 20,
    "str": 20,
    "con": 30,
    "agi": 15,
    "dex": 25,
    "int": 20,
    "will": 20,
    "cha": 20,
  },
  "Raivoaa": {
    "ws": 20,
    "str": 30,
    "con": 20,
    "agi": 30,
    "dex": 20,
    "int": 10,
    "will": 20,
    "cha": 20,
  },
  "Närvid": {
    "ws": 20,
    "str": 25,
    "con": 20,
    "agi": 30,
    "dex": 20,
    "int": 15,
    "will": 20,
    "cha": 20,
  },
  "Thulanjos": {
    "ws": 20,
    "str": 20,
    "con": 10,
    "agi": 15,
    "dex": 30,
    "int": 20,
    "will": 20,
    "cha": 30,
  },
  "Ildere": {
    "ws": 20,
    "str": 20,
    "con": 15,
    "agi": 20,
    "dex": 30,
    "int": 20,
    "will": 20,
    "cha": 25,
  },
}

TPO.statDescriptions = {
  "ws": "Weapon Skill is your ability to hit your enemy with melee and ranged weapons alike. This skill applies to Armaments, mundane weapons, even fist fights and brawls as the fundamentals of combat are universal, no matter the weapon.",
  "str": "Strength governs how much damage you deal in combat, as well as your ability to lift and carry things. It also helps determine your Character’s maximum Hit Points (HP)",
  "con": "Your ability to endure and overcome both damage in combat, and the draining effects of the world. It is primarily used to determine your Character’s max HP.",
  "agi": "Agility is your Character’s ability to weave and dodge in combat and their natural athleticism for things such as running or acrobatics.",
  "dex": "Dexterity is fine motor control. It’s how well your character can move their hands for things such as crafting, lockpicking, sleight of hand, or forging letters.",
  "int": "Intellect governs the ‘smarts’ of your character. It’s how well your Character can think through complicated problems or call up old knowledge from memory. It helps with healing, determining an enemy’s weakness, as well as calling up lore.",
  "will": "Will is a measure of your character’s levelheadedness and willpower. It helps with keeping a steady head during combat.",
  "cha": "Charisma is your character's personableness. It will help with convincing people to do things, deception, bribery, and all manner of other social skills",
}