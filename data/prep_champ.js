const axios = require('axios');
const fs = require('fs');
const jsdom = require('jsdom');

const do_download = true;

const wiki_host = 'http://leagueoflegends.fandom.com';
const wiki_item_path = '/api.php?format=json&action=parse&prop=text&text={{Module:ChampionData/data}}';
const wiki_item_url = wiki_host+wiki_item_path;

const wiki_file = './tmp/champ_wiki.html';

const dragon_output = './tmp/champ_dragon_data.json';
const wiki_output = './tmp/champ_wiki_data.json';
const final_output = './champ_data.json';

async function getWikiSource() {
  try {
    if (!do_download) return;
    const res = await axios.get(wiki_item_url).then();
    fs.writeFileSync(wiki_file, res.data.parse.text['*'])
  } catch (error) {
    console.log('failed query')
  }
}

const skip_keys = [
  'alttype','apiname','attack','be','changes','control','damage','date','defense','difficulty','herotype','magic','mobility',
  'op_positions','patch','positions','rangetype','role','rp','style','title','toughness','utility'
]
const stats_map = {
  arm_base: 'armor',
  arm_lvl: 'armorperlevel',
  as_base: 'attackspeed',
  as_lvl: 'attackspeedperlevel',
  as_ratio: 'attackspeedratio',
  dam_base: 'attackdamage',
  dam_lvl: 'attackdamageperlevel',
  hp_base: 'hp',
  hp_lvl: 'hpperlevel',
  hp5_base: 'hpregen',
  hp5_lvl: 'hpregenperlevel',
  mp_base: 'mp',
  mp_lvl: 'mpperlevel',
  mp5_base: 'mpregen',
  mp5_lvl: 'mpregenperlevel',
  mr_base: 'spellblock',
  m4_lvl: 'spellblockperlevel',
  ms: 'movespeed',
  range: 'attackrange',
  crit_mod: 'critmod',
}


function merge(){
  delete require.cache[require.resolve(dragon_output)];
  delete require.cache[require.resolve(wiki_output)];

  const {champ_data:dragon_data} = require(dragon_output);
  const {champ_data:wiki_data} = require(wiki_output);

  for (const id in wiki_data){
    const wiki_champ = wiki_data[id];
    
    wiki_champ.id = id;
    wiki_champ.ah = 0;
    wiki_champ.ap = 0;
    wiki_champ.resource = wiki_champ.mp;
    wiki_champ.mp *= wiki_champ.partype == 'Mana';
    
    // Include tags from top/mid etc.
    const dragon_champ = dragon_data.filter(x=>x.id == id)[0]
    if (dragon_champ){ // maybe not found, i.e. GnarBig or new champ
      wiki_champ.tags = champSearchTags(dragon_champ);
    }else{ // maybe not found, i.e. GnarBig or new champ
      wiki_champ.tags = [wiki_champ.id.toLowerCase(), wiki_champ.name.toLowerCase()];
    }
  }
  fs.writeFileSync(final_output, JSON.stringify({champ_data: wiki_data}));  
}


function prepDragon(){
    const champ_dd = require('./tmp/champion_11.16.1.json') // Champ info from Data Dragon
    const champ_data = []

    const perc_stats = ['attackspeed', 'attackspeedperlevel'];

    for (const id in champ_dd.data) {
        const champ = champ_dd.data[id];
        const {name, partype, stats, tags} = champ_dd.data[id];

        stats.ap = 0;
        stats.cdr = 0;

        if (partype.toLowerCase() != 'mana'){
            stats.resource = stats.mp;
            stats.mp = 0;
        }else{
            stats.resource = stats.mp;
        }

        perc_stats.forEach(stat => {
            stats[stat] /= 100;
        });

        champ_data.push(
            {
                name,
                id,
                ...stats,
                tags,
                partype,
            }
        );
    }

    fs.writeFileSync(dragon_output, JSON.stringify({champ_data}))
}

async function prepWiki(){
  await getWikiSource();
  let res = fs.readFileSync(wiki_file).toString();
  let doc = new jsdom.JSDOM('<!DOCTYPE html>'+res).window.document;
  res = doc.querySelector('pre').innerHTML; 
  let re_base = /return((?:.|\n)*)--/
  const cap_word =   new RegExp(/([\w\d\s\-'"\.)(%]+)/g).source;
  const noncap_word = new RegExp(/[\w\d\s\-'"\.)(%\|=#:]*?/g).source;
  res = res.match(re_base)[1]
    .replace(/&amp;/g,'&')
    .replace(/\[([\w\s\d'"&\-\.\(\)]+)\](\s*)=/g, '$1$2:')
    .replace(/{((?:(?:"[\w\s'\-\.<>;&/]+")(?:,\s?)*)+)}/g,'[$1]')
    .replace(/,(\s*[}\]])/g, '$1')
    .replace(/(\d+)(\s+):/g, '"$1"$2:')

  fs.writeFileSync(wiki_output, res);

  parseWikiJSON();
}

function parseWikiJSON(){
  const wiki_data = require(wiki_output);
  const new_data = {};
  for (const name in wiki_data){
    const old = wiki_data[name];
    const cur = {};
    
    cur.name = name;
    
    for (const key in old){
      if (skip_keys.includes(key)) continue;
      switch (key){
        case 'id': cur.key = old.id; break;
        case 'resource': cur.partype = old.resource; break;
        case 'stats': 
          for (stat in old.stats){
            if (Object.keys(stats_map).includes(stat)) {
              cur[stats_map[stat]] = old.stats[stat];
            }
          }
          break;
        default: cur[key] = old[key];
      }      
    }

    new_data[old.apiname] = cur;
  }

  fs.writeFileSync(wiki_output, JSON.stringify({champ_data : new_data}));
}


champSearchTags = function(champ=[]){
    const roles = {
        top:  [
            'Aatrox', 'Akali', 'Camille', 'Chogath', 'Darius', 'DrMundo', 
            'Fiora', 'Gangplank', 'Garen', 'Gnar', 'Gragas', 'Gwen', 'Heimerdinger','Illaoi', 
            'Irelia', 'Jax', 'Jayce', 'Kayle', 'Kennen', 'Kled', 'Lilia', 
            'Malphite', 'Maokai', 'Mordekaiser', 'Nasus', 'Ornn', 'Poppy', 
            'Quinn', 'Renekton', 'Riven', 'Sett', 'Shen', 'Singed', 'Sion', 
            'TahmKench', 'Teemo', 'Tryndamere', 'Urgot', 'Vayne', 'Vladimir','Volibear',
            'MonkeyKing', 'Yorick'
        ],
        jungle:  [
            'Amumu', 'Diana', 'DrMundo', 'Ekko', 'Elise', 'Evelynn', 'Fiddlesticks', 'Gragas',
            'Graves', 'Gwen', 'Hecarim', 'Ivern', 'Jarvan', 'Karthus', 'Kayn', 'KhaZix', 
            'Kindred', 'LeeSin', 'Lilia', 'MasterYi', 'Nidalee', 'Nocturne','Nunu','Olaf',
            'Poppy', 'Qiyana', 'Rammus', 'Reksai', 'Rengar', 'Sejuani', 'Shaco', 'Shyvana',
            'Skarner', 'Taliyah', 'Talon', 'Trundle', 'Udyr', 'Vi', 'Viego', 'Volibear',
            'Warsick', 'XinZhao', 'Zac'
        ],
        mid:  [
            'Ahri','Akali','Akshan','Anivia','Annie','AurelionSol','Azir','Brand','Cassiopeia','Chogath',
            'Corki','Diana','Ekko','Fizz','Galio','Gangplank','Graves','Heimerdinger','Irelia',
            'Jayce','Kassadin','Katarina','Kayle','LeBlanc','Lissandra','Lux','Malzahar','Neeko','Nunu',
            'Orianna','Pantheon','Pyke','Qiyana','Renekton','Rumble','Ryze','Seraphine','Soraka',
            'Swain','Sylas','Syndra','Taliyah','Talon','Tristana','Tryndamere','TwistedFate','Veigar',
            'VelKoz','Viego','Viktor','Vladimir','Xerath','Yasuo','Yone','Zed','Zilean','Zoe','Zyra'
        ],
        bot: [
            'Karthus','Seraphine','Syndra','Veigar','Viktor','Ziggs',
            'Akshan','Aphelios','Ashe','Caitlyn','Draven','Ezreal','Jhin','Jinx','Kaisa','Kalista',
            'Kindred','Kogmaw','Lucian','MissFortune','Samira','Senna','Sivir','Tristana',
            'Twitch','Varus','Vayne','Xayah','Yasuo'
        ],
        support: [
            'Alistar','Amumu','Annie','Bard','Blitzcrank','Brand','Braum','Galio','Janna',
            'Karma','Leona','Lulu','Lux','Maokai','Morgana','Nami','Nautilus','Neeko',
            'Pantheon','Pyke','Rakan','Rell','Senna','Seraphine','Sett','Shen',
            'Sona','Soraka','Swain','TahmKench','Taliyah','Taric','Thresh',
            'Veigar','VelKoz','Xerath','Yuumi','Zilean','Zyra'
        ]
    }
    const tags = [];

    tags.push(
      champ.id.toLowerCase(), 
      champ.name.toLowerCase(), 
      ...champ.tags.map(x=>x.toLowerCase())
    )
    if (tags.includes('fighter')) tags.push('bruiser');

    for (role in roles){
        if (roles[role].includes(champ.id)) {
            tags.push(role.toLowerCase());
            if (role == 'bot' && tags.includes('marksman')) tags.push('adc');
            if (role == 'jungle') tags.push('jg');
        }
    }

    return tags
}

async function main(){
  prepDragon();
  await prepWiki();
  merge()
}

main()