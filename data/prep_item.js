const axios = require('axios');
const fs = require('fs');
const jsdom = require('jsdom');

const do_download = true;

const wiki_host = 'http://leagueoflegends.fandom.com';
const wiki_item_path = '/api.php?format=json&action=parse&prop=text&text={{Module:ItemData/data}}';
const wiki_item_url = wiki_host+wiki_item_path;

const wiki_file = './tmp/item_wiki.html';

const item_output = './item_data.json';

const mythic_comps = [
    3802, // Lost Chapter
    4635, // Leeching Leer
    6029, // Ironspike Whip
    6660, // Bami's,
    6670, // Noonquiver
];


/* functions */
async function getWikiSource() {
  try {
    if (!do_download) return;
    const res = await axios.get(wiki_item_url).then();
    fs.writeFileSync(wiki_file, res.data.parse.text['*'])
  } catch (error) {
    console.log('failed query')
  }
}

function checkRemove(item){
  // Skip ornn item
  if (Object.prototype.hasOwnProperty.call(item, 'ornn'))
    return false;

  // Remove non-champ items
  if (Object.hasOwnProperty.call(item, 'type') && (item.type.includes('Turret') || item.type.includes('Minion')))
    return true;

  // Remove consumables
  if (Object.hasOwnProperty.call(item, 'effects') && item.effects.consume) 
    return true;

  // Remove champion specific (i.e. GP item, Fiddle scarecrow, Kalista spear)
  if (Object.hasOwnProperty.call(item, 'champion')) 
    return true;

  // Remove non SR
  if (Object.hasOwnProperty.call(item, 'maps') && !item.maps.sr) 
    return true;

  // Remove trinkets
  if (Object.hasOwnProperty.call(item, 'limit') && item.limit.includes('trinket')) 
    return true;
  
  // Remove item with no stats (e.g. stopwatches)
  if (!Object.hasOwnProperty.call(item, 'stats'))
    return true;
  
  return false;
}

function itemTier(item){
  const t2_leg_ids = [
    3003, // Archangel's
    3031, // Infinity Edge
    3041, // Mejai's 
    3089, // Deathcap
    4643, // Vigilant Wardstone
  ];

  const t1_epic_ids = [
    4641, // Watchful Wardstone
  ];

  if (Object.prototype.hasOwnProperty.call(item, 'type') && item.type.includes('Boots'))
    return 'boots';
  if (Object.prototype.hasOwnProperty.call(item, 'ornn'))
    return 'ornn';
  if (Object.prototype.hasOwnProperty.call(item, 'effects') && item.effects.mythic)
    return 'mythic';
  if (t2_leg_ids.includes(item.id) || item.tier >= 3)
    return 'legendary';
  if (item.tier == 2)
    return 'epic';
  if (item.tier == 1)
    return 'basic';
  throw `No tier found for ${item.id}.`
}

Object.prototype.fillRef = function(item2){
  for (const key in this){
    if (!Object.prototype.hasOwnProperty.call(this, key)) continue;
    if (typeof this[key] === 'object' && item2[key]) this[key].fillRef(item2[key]);
    if (typeof this[key] === 'string' && this[key].includes('=>')){
      if (item2[key] === undefined) {
        delete this[key];
      }else{
        this[key] = item2[key];
      }
    }
  }
}

function parseItemJson(){
  const item_data = require(item_output);

  /* Parse item references (e.g. =>Manamune) */
  for (const name in item_data){
    if (!Object.prototype.hasOwnProperty.call(item_data, name)) continue;
    const item1 = item_data[name];
    const itemstr = JSON.stringify(item1);
    // console.log(itemstr);
    if (itemstr.indexOf('=>') == -1) continue;
    const name2 = itemstr.match(/=>[\w\s\.\-']+/g)[0].replace('=>','');
    const item2 = item_data[name2];
    item1.fillRef(item2);
  }

  /* Parse Item limits */
  for (const name in item_data){
    const item = item_data[name];
    item.limits = itemLimits(item);
  }

  /* Construct tier List */
  const tierlist = {
    'ornn' : [],
    'mythic' : [],
    'legendary' : [],
    'boots' : [],
    'epic' : [],
    'mythiccomp' : [],
    'basic' : []
  }
  const tierlist_id = {
    'ornn' : [],
    'mythic' : [],
    'legendary' : [],
    'boots' : [],
    'epic' : [],
    'mythiccomp' : [],
    'basic' : []
  }

  for (const name in item_data) {
    const item = item_data[name];
    if (checkRemove(item)){
      delete item_data[name];
      continue;
    }
    tierlist[itemTier(item)].push(name);
    tierlist_id[itemTier(item)].push(item.id);

    if (mythic_comps.includes(item.id)){
      tierlist.mythiccomp.push(item);
      tierlist_id.mythiccomp.push(item.id);
    }

  }

  fs.writeFileSync(item_output, JSON.stringify({item_data, tierlist, tierlist_id}));
}

async function parseWikiSource(){
  await getWikiSource();
  let res = fs.readFileSync(wiki_file).toString();
  let doc = new jsdom.JSDOM('<!DOCTYPE html>'+res).window.document;
  res = doc.querySelector('pre').innerHTML; 
  let re_base = /return|--/g;
  const cap_word =   new RegExp(/([\w\d\s\-'"\.)(%]+)/g).source;
  const noncap_word = new RegExp(/[\w\d\s\-'"\.)(%\|=#:]*?/g).source;
  // const cap_word =   '([\\w\\d\\s\\-\'"\\\.)(%]+)';
  // const noncap_word = '[\\w\\d\\s\\-\'"\\\.)(%\\|=#:]*?';
  res = res.replace(re_base, '')
    .replace(/'{2,}([\w\s]+(?:\b'\b)?[\w\s]+\.?)'{2,}/g, '$1')
    .replace(/\[([\w\s\d'"\-\.\(\)]+)\](\s*)=/g, '$1$2:')
    .replace(new RegExp('\\[{2}'+noncap_word+'\\|'+cap_word+']{2}','g'), '$1')
    .replace(new RegExp('\\[{2}'+cap_word+']{2}','g'), '$1')
    .replace(new RegExp('{{(?:fd)'+noncap_word+'\\|'+cap_word+'}}','g'), '$1')
    .replace(new RegExp('{{(?:ai)'+noncap_word+'\\|'+cap_word+'}}','g'), '')
    .replace(new RegExp('{{sbc'+noncap_word+'\\|'+cap_word+'}}','g'), '')
    // .replace(/{{g\|(\d*)([\s\w]*gold)}}/g,'$1$2')
    // .replace(/{{g\|(\w\d+)}}/g,'$1 gold')
    .replace(new RegExp('{{(?:tt)|nearby|'+cap_word+'}}'),'g', 'within $1')
    .replace(new RegExp('{{(?:tip|ii|ft)'+noncap_word+'\\|'+cap_word+'}}','g'), '$1')
    .replace(/{((?:(?:"[\w\s'\-\.<>;&/]+")(?:,\s?)*)+)}/g,'[$1]')
    .replace(/,(\s*[}\]])/g, '$1')
    .replace(/&gt;/g,'>')
    .replace(/&lt;/g,'<')
    .replace(/&nbsp;/g,' ')
    .replace(/&amp;/g,'&');

  fs.writeFileSync(item_output, res);

  parseItemJson(item_output);
}

function itemLimits(item) {
    const limits = [];
    if (Object.prototype.hasOwnProperty.call(item, 'itemlimit')){
        const itemlimit = item.itemlimit.toLowerCase()
            .replace(' ', '') // e.g. 'mana charge', 'last whisper' 
            .replace('&','') // jungle&support => junglesupport
            .replace('mythic/',''); // mythic/lifeline => mythic
        limits.push(itemlimit);
    }

    if (mythic_comps.includes(item.id)) limits.push('mythiccomp');

    return limits;
}

parseWikiSource();