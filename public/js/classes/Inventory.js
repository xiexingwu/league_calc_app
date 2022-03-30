
/* Config class */
class InventoryConfig{
    constructor({
        config_div = '.inventory-config'
    }){
        if (typeof config_div == 'string') config_div = document.querySelector(config_div);
        this.config_div = config_div;

        this.config_groups = {};
    }
    removeConfigGroup(item){
        if (!this.config_groups.hasOwnProperty(item)) return;
        this.config_groups[item].remove()
    }
    /**
     * 
     * @param {numeric} item 
     * @param {string} type 'input' or 'toggle'
     */
    baseConfigGroup(item, type='input'){ 
        const input_group = document.createElement('div')
        input_group.classList.add('input-group','input-group-sm')
        input_group.setAttribute('item-id', item);
        input_group.id = ``;

        const input = document.createElement('input');
        input_group.append(input)

        if (type == 'input'){
            input.type = 'text';
            input.classList.add('form-check', 'text-center', 'p-0', 'm-0', 'ms-1');
            input.style.width = '4em';
        }else if(type == 'toggle'){
            input.type = 'checkbox';
            input.classList.add('btn-check');
            input.setAttribute('autocomplete', 'off'); // don't let browser remember selection
            input.id = `config-toggle-${item}`;
            
            const label = document.createElement('label');
            label.classList.add('btn', 'btn-outline-secondary');
            label.setAttribute('for', input.id);
            input_group.append(label);
        }

        this.config_div.append(input_group)
        return {input_group, input}
    }
    makeConfigGroup(item){
            // Tear items            
            if ([3070, 3003, 3004, 3040, 3042].includes(item)){
                this.makeTearConfigGroup(item);
            }
            // Seal / Mejai
            if ([3041, 1082].includes(item)){
                this.makeGLoryConfigGroup(item);
            }
            // Phantom dancer
            if (3046 == item){
                this.makePDConfigGroup(item);
            }
            // Trinity force
            if (3078 == item){
                this.makeTriforceConfigGroup(item);
            }
            // Hullbreaker
            if (3181 == item){
                this.makeHullbreakerConfigGroup(item);
            }
            // Deathcap
            if (3089 == item){
                this.makeDeathcapConfigGroup(item);
            }
            // Vigilant Wardstone
            if (4643 == item){
                this.makeWardstoneConfigGroup(item);
            }
    }

    makeTearConfigGroup(item){
        const {input_group, input} = this.baseConfigGroup(item, 'input');
        const upgraded = ['3040','3042'].includes(item); // Seraph or Muramana ?

        input.disabled = upgraded;
        input.value = upgraded * 360;

        const btn = document.createElement('button');
        const color = 'rgb(13,202,240)';
        btn.classList.add('btn', 'input-group-text');
        btn.innerText = upgraded ? 'Unstack Tear' : 'Stack Tear';
        btn.style.backgroundColor = color;
        btn.style.borderColor = color;

        input_group.prepend(btn);

        // Now setup listeners
        input.addEventListener('keypress', validateIntInput(0, 360, (evt) => false));
        input.addEventListener('change', (evt) => {
            // First update button text
            btn.innerText = input.value == 0 ? 'Stack Tear' : 'Unstack Tear';

            const do_downgrade = upgraded && input.value < 360;
            const do_upgrade = ['3003', '3004'].includes(item) && input.value == 360;
            if (do_downgrade || do_upgrade) this.swapTear(item);
        });

        const change_evt = new Event('change');
        btn.onclick = (evt) => {
            input.value = (input.value==0) * 360; 
            input.dispatchEvent(change_evt);
        }; 
    }
    swapTear(item){
        const swap_id = {
            3003 : 3040,
            3040 : 3003,

            3004 : 3042,
            3042 : 3004,
        }
        this.inventory.shop.shop_div.querySelector(`[id=select-${item}]`).setChecked(false);
        this.inventory.shop.shop_div.querySelector(`[id=select-${swap_id[item]}]`).setChecked(true, true) // Ignore disabled
    }

    makeGloryConfigGroup(item){
        const upgraded = item=='3041'; // Mejai or Dark Seal
        const max_stacks = upgraded ? 25 : 10;

        const {input_group, input} = this.baseConfigGroup(item, 'input');
        input.value = max_stacks;

        const btn = document.createElement('button');
        btn.classList.add('btn', 'input-group-text');
        btn.innerText = ['Stack', upgraded ? 'Mejai' : 'Seal'].join(' ');
        const color = 'rgb(200,0,200)';
        btn.style.backgroundColor = color;
        btn.style.borderColor = color;
        
        input_group.prepend(btn);

        // Now setup listeners
        input.addEventListener('keypress', validateIntInput(0, max_stacks, (evt) => false));
        input.addEventListener('change', (evt) => {
            // First update button text
            btn.innerText = [input.value == 0 ? 'Stack' : 'Unstack', upgraded ? 'Mejai' : 'Seal'].join(' ');
        });
        
        const change_evt = new Event('change');
        btn.onclick = (evt) => {
            input.value = (input.value==0) * max_stacks; 
            input.dispatchEvent(change_evt);
        };    
    }

    makePDConfigGroup(item){
        const max_stacks = 4;
        
        const {input_group, input} = this.baseConfigGroup(item, 'input');
        input.value = max_stacks;
        
        const btn = document.createElement('button');
        btn.classList.add('btn', 'input-group-text');
        btn.innerText = this.value == 0 ? 'Stack PD' : 'Unstack PD';
        const color = 'rgb(0,140,100)';
        btn.style.backgroundColor = color;
        btn.style.borderColor = color;
        
        input_group.prepend(btn);

        // Now setup listeners
        input.addEventListener('keypress', validateIntInput(0, max_stacks, (evt) => false));
        input.addEventListener('change', function (evt){
            // First update button text
            btn.innerText = this.value == 0 ? 'Stack PD' : 'Unstack PD';
        });
        
        const change_evt = new Event('change');
        btn.onclick = (evt) => {
            input.value = (input.value==0) * max_stacks; 
            input.dispatchEvent(change_evt);
        };    
    }

    makeTriforceConfigGroup(item){
        const max_stacks = 6;
        
        const {input_group, input} = this.baseConfigGroup(item, 'input');
        input.value = max_stacks;
        
        const btn = document.createElement('button');
        btn.classList.add('btn', 'input-group-text');
        btn.innerText = this.value == 0 ? 'Stack Triforce' : 'Unstack Triforce';
        const color = 'rgb(230, 184, 0)';
        btn.style.backgroundColor = color;
        btn.style.borderColor = color;
        
        input_group.prepend(btn);

        // Now setup listeners
        input.addEventListener('keypress', validateIntInput(0, max_stacks, (evt) => false));
        input.addEventListener('change', function (evt){
            // First update button text
            btn.innerText = this.value == 0 ? 'Stack Triforce' : 'Unstack Triforce';
        });
        
        const change_evt = new Event('change');
        btn.onclick = (evt) => {
            input.value = (input.value==0) * max_stacks; 
            input.dispatchEvent(change_evt);
        };    
    }

    makeHullbreakerConfigGroup(item){
        const {input_group, input} = this.baseConfigGroup(item, 'toggle');
        const label = input_group.querySelector('.label');

        label.classList.add('input-group-text');
        label.innerText = input.checked ? 'Hullbreaker (on)' : 'Hullbreaker (off)';

        // Now setup listeners
        label.onclick =  (evt) => {
            // input.setChecked(input.checked);
            label.innerText = !input.checked ? 'Hullbreaker (on)' : 'Hullbreaker (off)'; // due to bootstrap's .checked being activated later, use !input.checked
        };    
    }

}

/* Inventory class */
class Inventory{
    constructor({
        inventory_div = '.inventory',
    }){
        if (typeof inventory_div == 'string') inventory_div = document.querySelector(inventory_div);
        this.inventory_div = inventory_div;

        this.stats = ['ad','lethality','armpen','ap','mpen','mpenflat','as','crit','hp','armor','mr','hsp','hp5','hp5flat','omnivamp','lifesteal','ah','ms','msflat','mana','mp5'];

        const config_id = this.inventory_div.getAttribute('config-id'); // '#inventory-x-config'
        this.config_div = document.querySelector(config_id)
        this.config = new InventoryConfig(this.config_div);
        this.config.inventory = this;

        this.reset();
        this.initClickSellItem();
    }

    initClickSellItem(){
        this.inventory_div.addEventListener('click', (evt) => {
            if (evt.target.tagName != 'IMG') return;
            const item_id = evt.target.getAttribute('src').replace(/.*?(\d+)\.png/g, "$1");
            this.shop.shop_div.querySelector(`[id=select-${item_id}]`).setChecked(false);
        })
    }
    linkShop(shop){
        this.shop = shop;
    }
    reset(){
        this.flags = {
            tear : {stat:null,awe:null,stacks:null},
            glory : {seal:null, stacks:null},
            pd : {stacks:null},
            triforce : {stacks:null},
            hullbreaker : {passive:null}, 
            deathcap : {passive:null},
            wardstone : {passive:null}
        };
        this.stats.forEach(stat => {
            this[stat] = 0;
        });
        this.items = [];

        this.config.flags = this.flags;
    }

    buyItem(item){
        if (this.items.includes(item)) return;
        this.items.push(item);
        this.checkSpecialItems();

        /* add image and config */
        const img = document.createElement('img');
        img.setAttribute('src',`/icons/item/${item}.png`)
        this.inventory_div.append(img);
    }
    sellItem(item){
        const rank = this.items.findIndex(i => i == item);
        if(rank == -1) return;
        this.items.splice(rank, 1);
        this.checkSpecialItems();

        /* remove image & config */
        const img = this.inventory_div.querySelector(`img[src$="${item}.png"]`);
        img.remove();

        this.config.removeConfigGroup(item);
    }
    checkSpecialItems(){
        this.items.forEach(item =>{
            // Tear items
            if ([3070, 3003, 3004, 3040, 3042].includes(item)){
                const tear = {};
                this.flags.tear = tear;
                switch (item){
                    case 3070: // Tear
                        tear.stat = 'mp';
                        break;
                    case 3003: // Arch
                        tear.awe = 3;
                    case 3040: // Seraph
                        tear.awe = 5;
                        tear.stat = 'ap';
                        break;
                    case 3004: // Manamune
                    case 3042: // Muramana
                        tear.awe = 2.5;
                        tear.stat = 'ad';
                        break;
                }
                this.config.makeConfigGroup(item);
                return;
            }

            // Seal / Mejai
            if ([3041, 1082].includes(item)){
                const glory = {};
                this.flags.glory = glory;
                switch (item){
                    case 3041: // Mejai's Soulstealer
                        glory.seal = true;
                        break
                    case 1082: // Dark Seal
                        glory.seal = false;
                        break;
                }
                this.config.makeConfigGroup(item);
                return;
            }

            // Phantom dancer
            if (3046 == item){
                this.flags.pd = {stacks:0};
                this.config.makeConfigGroup(item);
                return;
            }

            // Trinity force
            if (3078 == item){
                this.flags.triforce = {stacks:0};
                this.config.makeConfigGroup(item);
                return;
            }

            // Hullbreaker
            if (3181 == item){
                this.flags.hullbreaker = {passive:true};
                this.config.makeConfigGroup(item);
                return;
            }

            // Deathcap
            if (3089 == item){
                this.flags.deathcap = {passive:true};
                this.config.makeConfigGroup(item);
                return;
            }

            // Vigilant Wardstone
            if (4643 == item){
                this.flags.wardstone = {passive:true};
                this.config.makeConfigGroup(item);
                return;
            }
        })
    }
    clickSellItem(){
        if (evt.target.tagName != 'IMG') return;
        const item_id = evt.target.getAttribute('src').replace(/.*?(\d+)\.png/g, "$1")
        this.shop_div.querySelector(`[id=select-${item_id}]`).setChecked(false);        
    }

    calcAD(base){return base*(1+this.trinity) + this.ad} // titanic
    calcArmPen(level){
        const flat = this.lethality*(0.6+level*0.4);
        return `${this.armpen}% + ${flat}`
    }
    calcMagPen(){return `${this.mpen}% + ${this.mpenflat}`}
    calcAS(ratio, bonus){return ratio*(1+bonus+this.attackspeed)}
    calcHP(base, vladimir=0){
        if (vladimir) calcHpAp(base);
        return base + this.hp
    } // Watchstone
    calcArmor(base){
        const res = base+this.armor;
        return `${res} (${calcDR(res)}% reduction)`
    }
    calcMR(base){
        const res = base+this.mr;
        return `${res} (${calcDR(res)}% reduction)`
    }
    calcHSP(){return this.hsp}
    calcHP5(base){return base*(1+this.hp5) + hp5flat}
    calcAH(){return `${this.ah} (${calcCDR(this.ah)})`}
    calcLS(){return this.lifesteal}
    calcOmni(){return this.omnivamp}
    calcMS(base){return base*(1+this.ms) + this.msflat}
    calcMP5(base){return base*(1+this.mp5)}

    calcAp(){
        return this.flat_ap * (1+this.dcap + this.watchstone)
    }
    calcManaAp(mp, ryze=0){
        // import('/mathjs/math.min.js')

        const a = mp;
        const d = ryze;

        const b = this.flat_mana; // flat mana from explicit item stats
        const c = this.awe > 0; // boolean flag for seraph/archangel
        const e = this.flat_ap; // flat ap from explicit item stats
        const f = this.awe; // actual awe percentage (3% or 5%)
        const g = this.dcap > 0; 
        const h = this.watchstone > 0; 

        const mult = (1+0.35*g+0.12*h);
        const A = [[1, -(a+b)*(0.025*c+0.05*d)/100],
            [-c*f*mult, 1]];
        const B = [[(a+b)*(1+0.05*c)], 
            [(e-a*c*f)*mult]];

    	const x = lusolve(A, B);
        return {ap: x[1], mp: x[0]}
        // const denom = (100*a*c*f + 100*b*c*f + 35*a*c*f*g + 12*a*c*f*h + 35*b*c*f*g + 12*b*c*f*h + 200*a*c*d*f + 200*b*c*d*f + 70*a*c*d*f*g + 24*a*c*d*f*h + 70*b*c*d*f*g + 24*b*c*d*f*h - 400000);
        // const num_mana = -((a + b)*(20000*c + 100*c*e + 200*d*e + 35*c*e*g + 12*c*e*h + 70*d*e*g + 24*d*e*h - 100*a*c*f - 35*a*c*f*g - 12*a*c*f*h - 200*a*c*d*f - 70*a*c*d*f*g - 24*a*c*d*f*h + 400000));
        // const num_ap = -(200*(2000*e + 700*e*g + 240*e*h + 2000*b*c*f + 100*a*c*f + 100*b*c*f + 35*a*c*f*g + 12*a*c*f*h + 35*b*c*f*g + 12*b*c*f*h + 700*b*c*f*g + 240*b*c*f*h));
        // return {
        //     ap: num_ap / denom,
        //     mana: num_mana / denom,
        // }
    }

    processItems(item_ids){
        item_ids.forEach(id =>{
            const item = item_data.findItemById(id);
            // Base stat
            for (stat in item.stats){
                if (this.stats[stat] == undefined) throw `UnID stat: ${stat} in ${id}`
                this.stats[stat] += item.stats[stat];
            }
        })
    }

    // addItem(id){
    //     this.items.push(id);
    // }
}

/* Stat modifiers */
// Locket (passive)
// Shurelya (active / passive)
// Ardent (passive)
// Staff of flowing water
// Cleaver (passive)
// Frozen Heart

/* Damage Modifiers */
// Riftmaker
// Prowler's
// Horizon

// Anathema's
// Abyssal Mask

