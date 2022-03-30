const item_filter_dropdown = document.querySelector('#item-filter-dropdown');
const stat_filters = document.querySelectorAll('input[name=filter-stat]');
const role_filters = document.querySelectorAll('input[name=filter-role]');

const boots_selectors = document.querySelectorAll('input[tier=boots]>input');
const mythic_selectors = document.querySelectorAll('[tier=mythic]>input,[tier=ornn]>input');

const clear_stat_btn = document.querySelector('#clear-stat-btn');
const clear_role_btn = document.querySelector('#clear-role-btn');

/* Mutation Observers */
const item_filter_obs = new MutationObserver(updateItemSelection);
const item_limit_obs = new MutationObserver(itemLimits);
item_filter_obs.observe(item_filter_dropdown, obs_select_config);
item_limit_obs.observe(item_selector, obs_select_config);



/* Item limits */
/* Implementation note: Using [disabled=*reason*] instead of [disabled=true/false] */
function itemLimits(input_mutations, observer){

    input_mutations.forEach(input_mutation => {
        const input = input_mutation.target;

        const form = input.parentNode;
        
        // limit tier: boots/mythic
        let tier = form.getAttribute('tier');
        if (tier == 'boots') 
            input.setPeersDisabled(boots_selectors, input.checked ? tier : false);
        if (tier == 'mythic' || tier == 'ornn') 
            input.setPeersDisabled(mythic_selectors, input.checked ? tier : false);
        
        // itemlimits (tear / qss / tiamat / sightstone / void / mejai / jg&sup / crit / lifeline / last whisper )
        // Apply limit of mutation
        const limits_str = form.getAttribute('limits');
        if (limits_str.length){
            limits_str.split('-').forEach(limit => {
                    const peers = item_selector.querySelectorAll(`[limits*=${limit}] > input`);
                    input.setPeersDisabled(peers, input.checked ? limit : false);
            })
        }
    })

    /* Max 6 items */
    const active_items = item_selector.querySelectorAll('input[checked]');
    item_selector.querySelectorAll('input:not([checked])').forEach(peer => {
        if (['',null].includes(peer.getAttribute('disabled'))) peer.disabled = (active_items.length >= 6);
    })
}

/* Filter items */
function updateItemSelection(mutationsList, observer){

    // setup default filter
    let role_filter = '';
    let stats_to_show = (stat_str = clear_stat_btn.getAttribute('tags')) ? stat_str.split('-') : [];
    const stats_to_remove = [];

    
    // update stat filter based on selections
    mutationsList.forEach(mutation => {
        const filter = mutation.target;
        const stat = filter.id.replace('filter-','');
        if (filter.getAttribute('name') == 'filter-stat'){
            (filter.checked ? stats_to_show : stats_to_remove).push(stat);
        }
    })

    // Get role_filter from radio buttons
    role_filters.forEach(filter => {if (filter.checked) role_filter =  filter.id.replace('filter-','')});

    // update item filter
    stats_to_show = stats_to_show.filter(e => (!stats_to_remove.includes(e)));
    clear_stat_btn.setAttribute('tags', stats_to_show.join('-'));
    clear_stat_btn.innerText = stats_to_show.length ? 'Unselect All' : 'Select All';

    item_selector.querySelectorAll('[id*=select-]').forEach(selector => {
        const item = selector.parentNode;
        
        // Boots are never filtered
        if (item.getAttribute('tier') == 'boots') return; 
        
        // first filter role
        const tags = item.getAttribute('tags');
        if (!tags.includes(role_filter)){
            item.classList.add('d-none');
            return;
        }else{
            item.classList.remove('d-none');
        }

        // then filter stats
        if (!stats_to_show.some(stat => tags.split('-').includes(stat))){
            item.classList.add('d-none');
            return;
        }
    })
}


