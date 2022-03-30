
/* Setup specific to stats_calc page */
const table_div = document.getElementById('table');
const plot_div = document.getElementById('plot-div');

const stats_selector = document.querySelector('#stats-selector')
const collapse_stats = stats_selector.querySelectorAll('.collapse-stats-selector');


// Collapse stats selector
collapse_stats.forEach(collapse =>{
    const select_btn = collapse.querySelector('button[id$=-btn]');
    const selectors = collapse.querySelectorAll('input[id^=select-]');
    select_btn.addEventListener('click', selectAllListener(selectors))
})

// Set initial hidden stats
const init_hidden_stats = stats_selector.querySelectorAll('input:not([checked])');
init_hidden_stats.forEach(hidden => {
    const stat = hidden.id.replace('select-stats-','');
    table_div.querySelectorAll(`[col=${stat}]`).forEach( col => col.classList.add('d-none'));
})

// Buttons in offcanvas to show/hide plot and table 
document.getElementById('showhide-plot-btn').addEventListener('click', evt => {
    document.getElementById('plot-container').classList.toggle('d-none')
})
document.getElementById('showhide-table-btn').addEventListener('click', evt => {
    document.getElementById('table-container').classList.toggle('d-none')
})

/**
 * Inventory, Champs, Runes instances
 */
const filter = new Filter({});
const shop = new Shop({});
const inventory = new Inventory({});
const runes = new Runes('#rune-cart-1');
const champs = new Champs(inventory, runes);

/**
 * Table and Plots
 */
const table = new Table({
    table_div, 
    champs, 
    champ_selector, 
    stats_selector
})
const plot_data = new PlotData({plot_div});

$.getJSON( "/data/champ_data.json", loadChampData);

function loadChampData(data){
    Object.assign(champ_data, data.champ_data);
    for (const id in champ_data){
        champs.newChamp(champ_data[id]);
    }
    setupTablePlot();
}
function setupTablePlot(){


    filter.linkShop(shop);

    shop.linkInventory(inventory);
    inventory.linkShop(shop);

    table.linkPlotData(plot_data);
    plot_data.linkTable(table);

    plot_data.sortByY();

    // Datatables
    $(document).ready( function () {
        $(table.table_div).DataTable({
            scrollX: true,
            scrollCollapse: false,

            info: false,
            paging: false,
            searching:false,
            orderFixed: {post: [[0, 'asc']]}, // always sort by Col 0 (name) last
        });
    });

    /**
     * Feature demo
     */
    table.table_div.querySelector('#tab-Aatrox').click() // initial demo: Click Aatrox row 

    runes.primary.findOptionByRune('Precision').click();
    runes.secondary.findOptionByRune('Domination').click();

}



