const item_data = {};
const tierlist = {};
const tierlist_id = {};
$.getJSON( "/data/item_data.json", function( data ) {
    Object.assign(item_data, data.item_data);
    Object.assign(tierlist, data.tierlist);
    Object.assign(tierlist_id, data.tierlist_id);
});

// const offstats = {
//     attackdamage: ['ad'],
//     armpen : ['lethality', 'armpen'],
//     ap: ['ap'],
//     mpen: ['mpen', 'mpenflat'],
//     attackspeed: ['as'],
//     crit: ['crit'],
// };
// const defstats = {
//     hp: ['hp'],
//     armor: ['armor'],
//     spellblock: ['mr'],
//     hsp: ['hsp'],
//     hpregen: ['hp5','hp5flat'],
// };
// const miscstats = {
//     omnivamp: ['omnivamp'],
//     lifesteal: ['lifesteal'],
//     ah: ['ah'],
//     movespeed: ['ms','msflat'],
//     mp: ['mana'],
//     mpregen: ['mp5'],
// };

/* Setup item lookup, i.e. id => name */
const item_lookup = {}
for (const name in item_data){
    item_lookup[item_data[name].id] = name;
}

item_data.findItemById = function(id){
    return item_data[item_lookup[id]];
}

class Filter{
    constructor({
        filter_dropdown = document.querySelector('#item-filter-dropdown'), 
        stat_inputs = document.querySelectorAll('input[name=filter-stat]'), 
        role_inputs = document.querySelectorAll('input[name=filter-role]'), 

        clear_stat_btn = document.querySelector('#clear-stat-btn'), 
        clear_role_btn = document.querySelector('#clear-role-btn'), 
    }){
        this.filter_dropdown = filter_dropdown;
        this.clear_stat_btn = clear_stat_btn;
        this.clear_role_btn = clear_role_btn;
        
        /* clear filter buttons */
        clear_role_btn.addEventListener('click',(evt) =>{
            role_inputs[0].getPeers().forEach(peer => peer.setChecked(false));
        })
        clear_stat_btn.addEventListener('click',(evt) =>{
            stat_inputs[0].getPeers().forEach(peer => peer.setChecked(false));
        })

        /* Apply filtering */
        const item_filter_obs = new MutationObserver(this.showHideItems());
        const item_limit_obs = new MutationObserver(this.disableItems());
        item_filter_obs.observe(filter_dropdown, obs_select_config);
        item_limit_obs.observe(item_selector, obs_select_config);
    }

    linkShop(shop){
        this.shop = shop;
    }

    get role_filter(){
        const role_selection = this.filter_dropdown.querySelector('input[name=filter-role]:checked'); // null if nothing checked
        if (role_selection === null) return null;
        return role_selection.value;
    }
    get stat_filters(){
        const stat_selections = this.filter_dropdown.querySelectorAll('input[name=filter-stat]:checked'); // Nodelist[] if nothing checked
        if (!stat_selections.length) return [];
        return Array.from(stat_selections).map(sel => sel.value);
    }

    /* filtering observers */
    disableItems(){return (input_mutations, observer) => {
        const purchased_items = this.shop.inventory.items;

        /* If purchasing mythic with mythic component, sell the component and terminate this mutation */
        try{
            input_mutations.forEach(input_mutation => {
                const input = input_mutation.target;
                const id = input.id.replace('select-','');
                
                const has_mythiccomp = purchased_items.some(id => tierlist_id.mythiccomp.includes(id));
                const bought_mythic = tierlist_id.ornn.includes(id) || tierlist_id.mythic.includes(id);
                if (has_mythiccomp && bought_mythic){
                    this.shop.mythiccomp.forEach(input => input.setChecked(false)); // Sell mythic component
                    throw `Upgraded mythic comp to mythic.`;
                }
            })
        }catch (e){
            return;
        }

        /* Max 6 items */
        if(purchased_items.length >= 6){
            this.shop.shop_div.querySelectorAll('input:not([checked])').forEach(peer => {
                if (['',null].includes(peer.getAttribute('disabled'))) peer.disabled = 6;
            })
            return;
        }

        /* Apply purchase limits */
        input.setPeersDisabled(this.shop.items, false);
        purchased_items.forEach(id => {
            const input = this.shop.shop_div.querySelector(`[id$=${id}]`);
            /* Bought boots */
            if (tierlist_id.boots.includes(id)){
                input.setPeersDisabled(this.shop.boots, 'boots');
                return;
            }
            /* Bought mythic */
            if (tierlist_id.ornn.includes(id) || tierlist_id.mythic.includes(id)){
                input.setPeersDisabled(this.shop.mythic, 'mythic');
                input.setPeersDisabled(this.shop.ornn, 'mythic');
                input.setPeersDisabled(this.shop.mythiccomp, 'mythic');
                return;
            }
            /* Bought mythic comp */
            if (tierlist_id.mythiccomp.includes(id)){
                const other_mythics = tierlist_id.mythic.filter(mythic_id =>{
                    !item_data.findItemById(mythic_id).recipe.includes(item_lookup[id]);
                }); // find mythics not built of this component
                input.setPeersDisabled(this.shop.mythiccomp, 'mythiccomp');
                input.setPeersDisabled(this.shop.othermythics, 'mythiccomp');
            }            

            /* Other limits, e.g. tear / qss / tiamat / sightstone / void / mejai / jg&sup / critmodifier / lifeline / last whisper */
            const item = item_data.findItemById(id);
            const limits = item.limits;
            if (limits.length){
                /* forEach is extraneous here, since so far items have at MOST one limit */
                limits.forEach(limit => {
                    const limited_ids = item_data.filter(item => item.limits.includes(limit)).map(item => item.id);
                    const limited_items = Array.from(this.shop.items).filter(item => limited_ids.includes(item.id.replace('select-','')));
                    input.setPeersDisabled(limited_items, limit);
                })
            }
        })

    }}

    showHideItems(){return (filter_mutations, observer) =>{
        const role_filter = this.role_filter;
        const stat_filters = this.stat_filters;

        // update item filter
        this.shop.items.forEach(input => {
            const id = input.id.replace('select-','');
            const item = item_data.findItemById(id);
            
            // Boots are never filtered
            if (tierlist_id.boots.includes(id)) return;
            
            // first filter role
            if (!item.menu[role_filter]){
                input.classList.add('d-none');
                return;
            }else{
                input.classList.remove('d-none');
            }

            // then filter stats
            if (stat_filters.some(filter => item.stats[filter] == null)){
                input.classList.add('d-none');
                return;
            }
        })
    }}

}

/* Shop filter */
class Shop{
    constructor({
        shop_div='#item-selector',
    }){
        if (typeof shop_div == 'string') shop_div = document.querySelector(shop_div);
        this.shop_div = shop_div;

        this.initMutationObservers();
        this.items = this.shop_div.querySelectorAll('input[id^=select-]');

        this.boots = this.shop_div.querySelectorAll('#collapse-boots input');
        this.mythic = this.shop_div.querySelectorAll('#collapse-mythic input');
        this.ornn = this.shop_div.querySelectorAll('#collapse-ornn input');
        // this.mythiccomp = Array.from(this.shop_div.querySelectorAll('#collapse-epic input'))
        //     .filter(i=>tierlist_id.mythiccomp.includes(parseInt(i.id.replace('select-',''))))
    }
    initMutationObservers(){
        const config = {
            attributes: true,
            attributeFilter: ['checked'],
            subtree: true,
        };
        this.item_select_obs = new MutationObserver(this.clickShopTrade());
        this.item_select_obs.observe(this.shop_div, config);
    }
    linkInventory(inventory){
        this.inventory = inventory;
        this.items.forEach(item => {
            const id = item.id.replace('select-','');
            item.setChecked(inventory.items.includes(id))
        })
    }
    clickShopTrade(){
        return (input_mutations, observer) => {            
            input_mutations.forEach(input_mutation => {
                const input = input_mutation.target;
                const item = input.id.replace('select-','');
                if (input.checked) {
                    this.inventory.buyItem(item);
                } else {
                    this.inventory.sellItem(item);
                }
            })
        }
    }


}