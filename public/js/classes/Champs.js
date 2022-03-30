const champ_data = {}
$.getJSON( "/data/champ_data.json", function( data ) {
    Object.assign(champ_data, data.champ_data);
});

class Champs{
    growable_stats = [
        'attackdamage', 'attackspeed', 
        'hp', 'armor', 'spellblock',  'hpregen',
        'mp', 'mpregen'];
    growth_stats = ['hpperlevel','mpperlevel','hpregenperlevel','mpregenperlevel','attackdamageperlevel',
        'attackspeedperlevel','armorperlevel','spellblockperlevel'];
    item_stats = ['armpen','ap','magpen','crit','lifesteal', 'omnivamp', 'hsp','ah', 'movespeed',  'attackrange']

    constructor(inventory, runes, level=1){
        this.inventory = inventory;
        this.runes = runes;
        this.level = level;
        this.champ_data = {};
    }

    newChamp(champ){
        this.champ_data[champ.id] = new Champ(champ, this.inventory, this.runes);
    }
    processChamps(level){
        this.level = level;
        for (const id in this.champ_data){
            const champ = this.champ_data[id];
            champ.processChamp(level);
        }
    }

}

class Champ{
    constructor(champ, inventory, runes){
        this.inventory = inventory;
        this.runes = runes;
        this.level = 1;

        for (const stat in champ){
            this[stat] = champ[stat];
        }
    }

    /* 
    @param(inventory) class Finalinventorytats
    */  
    processChamp(level){
        this.level = level;
        
        const inventory = this.inventory
        const d = champ_data[this.id];
        const champ = this;

        champ.movespeed = inventory.calcMS(d.movespeed);
        champ.omnivamp = inventory.calcOmni();
        champ.ah = inventory.calcAH();
        champ.lifesteal = inventory.calcLS();
        champ.armpen = inventory.calcArmPen(this.level);
        champ.magpen = inventory.calcMagPen();
        champ.hsp = inventory.calcHSP();


        champ.hp = inventory.calcHP(this.calcGrowth(d.hp)); // vladimir
        champ.attackdamage = inventory.calcAD(this.calcGrowth(d.attackdamage));
        champ.attackspeed = 0; //inventory.calcAS(d.attackspeedratio, d.attackspeedbonus);
        champ.armor = inventory.calcArmor(this.calcGrowth(d.armor));
        champ.spellblock = inventory.calcMR(this.calcGrowth(d.spellblock));
        champ.hpregen = inventory.calcHP5(this.calcGrowth(d.hpregen));
        champ.mpregen = inventory.calcMP5(this.calcGrowth(d.mpregen));

        
        const mp = d.partype.toLowerCase() == 'mana' ? this.calcBase(d.mp) : 0

        if (mp == 0){
            champ.ap = inventory.calcAp();
        }else{
            ({mp:champ.mp, ap:champ.ap} = inventory.calcManaAp(mp, ryze));
        }
    }


    calcGrowth(){return (this.level-1) * (.7025 + .0175 * (this.level-1));}
    calcBase(base, growth) {return base + growth*this.calcGrowth()}
}