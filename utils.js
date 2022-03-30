module.exports = {

hidden_champ_stats : ['id', 'crit', 'critperlevel'],
hidden_item_stats : ['movement','msflat','gp10'],

offstats : ['attackdamage', 'armpen' , 'ap', 'magpen', 'attackspeed', 'crit'],
defstats : ['hp', 'armor', 'spellblock', 'hsp', 'hpregen'],
miscstats : ['lifesteal', 'omnivamp', 'ah', 'movespeed', 'mp', 'mpregen', 'attackrange', 'partype','resource'],
growthstats : ['hpperlevel','mpperlevel','hpregenperlevel','mpregenperlevel','attackdamageperlevel','attackspeedperlevel','armorperlevel','spellblockperlevel'],

no_plot_stats : ['name','id','critperlevel','partype','resource','armpen', 'ap', 'magpen', 'crit', 'hsp', 'lifesteal','omnivamp','ah','partype','resource'],

default_stats_to_show : ['attackdamage', 'attackspeed','hp','armor','spellblock','movespeed','attackrange', 'ap','misc'],

champ_stats_name : {
    name: 'Name',
    id: 'ID',

    hp: 'Health',
    attackdamage: 'AD',
    attackspeed: 'AS',
    armor: 'Armor',
    spellblock: 'MR',
    movespeed: 'Movespeed',
    attackrange: 'Attack Range',
    mp: 'Mana',
    hpregen: 'HP / 5',
    mpregen: 'MP / 5',

    hpperlevel: 'HP / Lvl',
    attackdamageperlevel: 'AD / Lvl',
    attackspeedperlevel: 'AS / Lvl',
    armorperlevel: 'Armor / Lvl',
    spellblockperlevel: 'MR / Lvl',
    mpperlevel: 'Mana / Lvl',
    hpregenperlevel: 'HP / 5 / Lvl',
    mpregenperlevel: 'MP / 5 / Lvl',
    
    ap: 'AP',
    ah: 'Ability Haste (CDR)',
    crit: 'Crit',
    critperlevel: 'Crit / Lvl',
    armpen: 'Armor Pen',
    mpen: 'Magic Pen',
    hsp: 'Heal & Shield Power',
    lifesteal: 'Lifesteal',
    omnivamp: 'Omnivamp',    
    
    partype: 'Resource Type',
    resource: 'Resource',
},

champ_stats_groups : {
    offstats: 'Offensive Stats',
    defstats: 'Defensive Stats',
    miscstats: 'Misc Stats',
    growthstats: 'Growth Stats'
},

// champSearchTags: function(champ){
//     const roles = {
//         top:  [
//             'Aatrox', 'Akali', 'Camille', 'Chogath', 'Darius', 'DrMundo', 
//             'Fiora', 'Gangplank', 'Garen', 'Gnar', 'Gragas', 'Gwen', 'Heimerdinger','Illaoi', 
//             'Irelia', 'Jax', 'Jayce', 'Kayle', 'Kennen', 'Kled', 'Lilia', 
//             'Malphite', 'Maokai', 'Mordekaiser', 'Nasus', 'Ornn', 'Poppy', 
//             'Quinn', 'Renekton', 'Riven', 'Sett', 'Shen', 'Singed', 'Sion', 
//             'TahmKench', 'Teemo', 'Tryndamere', 'Urgot', 'Vayne', 'Vladimir','Volibear',
//             'MonkeyKing', 'Yorick'
//         ],
//         jungle:  [
//             'Amumu', 'Diana', 'DrMundo', 'Ekko', 'Elise', 'Evelynn', 'Fiddlesticks', 'Gragas',
//             'Graves', 'Gwen', 'Hecarim', 'Ivern', 'Jarvan', 'Karthus', 'Kayn', 'KhaZix', 
//             'Kindred', 'LeeSin', 'Lilia', 'MasterYi', 'Nidalee', 'Nocturne','Nunu','Olaf',
//             'Poppy', 'Qiyana', 'Rammus', 'Reksai', 'Rengar', 'Sejuani', 'Shaco', 'Shyvana',
//             'Skarner', 'Taliyah', 'Talon', 'Trundle', 'Udyr', 'Vi', 'Viego', 'Volibear',
//             'Warsick', 'XinZhao', 'Zac'
//         ],
//         mid:  [
//             'Ahri','Akali','Akshan','Anivia','Annie','AurelionSol','Azir','Brand','Cassiopeia','Chogath',
//             'Corki','Diana','Ekko','Fizz','Galio','Gangplank','Graves','Heimerdinger','Irelia',
//             'Jayce','Kassadin','Katarina','Kayle','LeBlanc','Lissandra','Lux','Malzahar','Neeko','Nunu',
//             'Orianna','Pantheon','Pyke','Qiyana','Renekton','Rumble','Ryze','Seraphine','Soraka',
//             'Swain','Sylas','Syndra','Taliyah','Talon','Tristana','Tryndamere','TwistedFate','Veigar',
//             'VelKoz','Viego','Viktor','Vladimir','Xerath','Yasuo','Yone','Zed','Zilean','Zoe','Zyra'
//         ],
//         bot: [
//             'Karthus','Seraphine','Syndra','Veigar','Viktor','Ziggs',
//             'Akshan','Aphelios','Ashe','Caitlyn','Draven','Ezreal','Jhin','Jinx','Kaisa','Kalista',
//             'Kindred','Kogmaw','Lucian','MissFortune','Samira','Senna','Sivir','Tristana',
//             'Twitch','Varus','Vayne','Xayah','Yasuo'
//         ],
//         support: [
//             'Alistar','Amumu','Annie','Bard','Blitzcrank','Brand','Braum','Galio','Janna',
//             'Karma','Leona','Lulu','Lux','Maokai','Morgana','Nami','Nautilus','Neeko',
//             'Pantheon','Pyke','Rakan','Rell','Senna','Seraphine','Sett','Shen',
//             'Sona','Soraka','Swain','TahmKench','Taliyah','Taric','Thresh',
//             'Veigar','VelKoz','Xerath','Yuumi','Zilean','Zyra'
//         ]
//     }
//     const tags = [];

//     tags.push(champ.id, champ.name, ...champ.tags)
//     if (tags.includes('fighter')) tags.push('bruiser');

//     for (role in roles){
//         if (roles[role].includes(champ.id)) {
//             tags.push(role);
//             if (role == 'bot' && tags.includes('Marksman')) tags.push('adc');
//             if (role == 'jungle') tags.push('jg');
//         }
//     }

//     return tags
// },


item_stats_name:{
    ad: 'Attack Damage',
    lethality: 'Lethality',
    armpen: 'Armor Pen',
    ap: 'Ability Power',
    mpen: 'Magic Pen',
    mpenflat: 'Magic Pen (Flat)',
    as: 'Attack Speed',
    crit: 'Crit Chance',
    lifesteal: 'Life Steal',
    omnivamp: 'Omnivamp',
    ah: 'Ability Haste',
    hp: 'Health',
    mana: 'Mana',
    armor: 'Armor',
    mr: 'Magic Resist',
    ms: 'Movement Speed',
    msflat: 'Movement Speed (Flat)',
    hsp: 'Heal & Shield Power',
    hp5: 'Health Regen',
    hp5flat: 'Health Regen (Flat)',
    mp5: 'Mana Regen',
    gp10: 'Gold per 10',
    spec: 'Misc',
    movement: 'Movement', // menu tag
},

item_stats_abbr:{
    ad: 'AD',
    lethality: 'Lethal.',
    armpen: 'Arm Pen %',
    ap: 'AP',
    mpen: 'M Pen %',
    mpenflat: 'M Pen',
    as: 'AS',
    crit: 'Crit%',
    lifesteal: 'L Steal',
    omnivamp: 'Vamp',
    ah: 'AH',
    hp: 'HP',
    mana: 'MP',
    armor: 'Armor',
    mr: 'MR',
    ms: 'MS %',
    msflat: 'MS',
    hsp: 'Heal/Shield',
    hp5: 'HP Reg',
    hp5flat: 'HP Reg',
    mp5: 'Mp Reg',
    gp10: 'Gold/10',
    spec: 'Misc',
    movement: 'MS', // menu tag
},

item_menu_tags_name:{
    assassin:'Assassin',
    fighter:'Bruiser',
    mage:'Mage',
    marksman:'Marksman',
    support:'Support',
    tank:'Tank',
},

// removeDuplicates(arr){
//     return [...new Set(arr)]
// },
// sanitiseSearch(str){
//     return str.toLowerCase().replace('.','').replace('&','').replace('\'','').replace(/\s+/g,'')
// },

// itemTags: function (item) {
//     const tags = [];
//     // console.log(item);
//     if (Object.prototype.hasOwnProperty.call(item, 'menu')){
//         for (const tag in item.menu) {
//             if (Object.prototype.hasOwnProperty.call(this.item_tags_name, tag))
//                 tags.push(tag);
//         }
//     }
//     if (Object.prototype.hasOwnProperty.call(item, 'stats')){
//         for (const tag in item.stats) {
//             tags.push(tag);
//             if (!Object.prototype.hasOwnProperty.call(this.item_stats_name, tag)) console.log(item.stats);
//         }
//     }
//     return tags.join('-')
// },

// itemLimits: function (item) {
//     const limits = [];
//     if (Object.prototype.hasOwnProperty.call(item, 'itemlimit')){
//         const itemlimit = item.itemlimit.toLowerCase()
//             .replace(' ', '') // e.g. 'mana charge', 'last whisper' 
//             .replace('&','') // jungle&support => junglesupport
//             .replace('mythic/',''); // mythic/lifeline => mythic
//         limits.push(itemlimit);
//     }

//     const mythic_comps = [
//         3802, // Lost Chapter
//         4635, // Leeching Leer
//         6029, // Ironspike Whip
//         6660, // Bami's,
//         6670, // Noonquiver
//     ];

//     if (mythic_comps.includes(item.id)) limits.push('mythiccomp');

//     return limits.join('-');
// },

rune_pages:{
    Precision : [
            ['pta','lethaltempo','fleet','conqueror'],
            ['overheal','triumph','presence'],
            ['alacrity','tenacity','bloodline'],
            ['coup','cutdown','laststand']
        ],
    Domination : [],
    Sorcery : [],
    Resolve : [],
    Inspiration : []
},

shards : [
    ['adaptive','as','haste'],
    ['adaptive','armor','mr'],
    ['health','armor','mr']
]

}