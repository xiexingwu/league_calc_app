
class Table{
    constructor({
        table_div='#table', 
        champs, 
        champ_selector='#champ-selector', 
        stats_selector='#stats-selector',
    }){
        if (!champs) throw 'Must specify champs on initialisation.'
        if (typeof table_div == 'str') table_div = document.querySelector(table_div);
        this.table_div = table_div;
        
        this.thead = this.table_div.querySelector('thead');
        this.tbody = this.table_div.querySelector('tbody');
        
        this.trows = Array.from(this.tbody.querySelectorAll('tr'));
        
        this.champs = champs;

        this.hidden_ids = [];

        this.initMutationObservers(champ_selector, stats_selector);
    }
    hideRow(id){
        if (!this.hidden_ids.includes(id)) this.hidden_ids.push(id);
    }
    showRow(id){
        const pos = this.hidden_ids.findIndex(hidden_id => hidden_id == id);
        if (pos != -1) this.hidden_ids.splice(pos, 1);
    }

    linkPlotData(plot_data){
        this.plot_data = plot_data;
        this.initClickRowToPlotHover();
    }

    initMutationObservers(champ_selector, stats_selector){
        if (typeof champ_selector == 'str') champ_selector = document.getElementById(champ_selector);
        if (typeof stats_selector == 'str') stats_selector = document.getElementById(stats_selector);

        const config = {
            attributes: true,
            attributeFilter: ['checked'],
            subtree: true,
        };
        this.champ_select_obs = new MutationObserver(this.updateTableSelection());
        this.stats_select_obs = new MutationObserver(this.hideCol());
        this.champ_select_obs.observe(collapse_champ, config);
        this.stats_select_obs.observe(stats_selector, config);
    }
    
    initClickRowToPlotHover(){
        this.table_div.addEventListener('click', (evt) => {
            const tr = this.tracePathToTableTr(evt.path);
            tr.classList.toggle('clicked')

            const champ_id = tr.id.replace('tab-','');
            if (tr.classList.contains('clicked')) {
                this.plot_data.moveChampDataToHover(champ_id);
            }else{
                this.plot_data.moveChampHoverToData(champ_id);
            }
            this.plot_data.replot();
        })
    }

    tracePathToTableTr(path){
        let tr;
        for (const target of path){
            if (target.tagName == 'TR' && this.table_div.contains(target)){
                tr = target;
                break;
            }
        }
        if (tr == undefined) throw `No <tr> found in event.path`;
        return tr;
    }

    updateTableSelection() {
        return (mutationsList, observer) => {
            const added = []; // added rows
            const removed = []; // removed rows
            // Observing (#collapse_champ > input[id^=select-]) 
            mutationsList.forEach(mutation => {
                const input = mutation.target;
                const champ_id = input.id.replace('select-','')

                if (input.checked) {
                    this.showRow(champ_id);
                    added.push(champ_id);
                }else{
                    this.hideRow(champ_id);
                    removed.push(champ_id);
                }
            });

            // Update table rows
            this.trows.filter(tr => added.includes(tr.id.replace('tab-',''))).forEach(tr => {
                tr.classList.remove('d-none')
            });
            this.trows.filter(tr => removed.includes(tr.id.replace('tab-',''))).forEach(tr => {
                tr.classList.add('d-none')
            })
            this.fillTableData(this.trows.filter(tr => added.includes(tr.id.replace('tab-',''))));

            // Update plot
            if (this.plot_data){
                added.forEach(id => this.plot_data.addChamp(id));
                removed.forEach(id => this.plot_data.removeChamp(id)); 
                this.plot_data.replot();
            };
        }
    }


    findRowById(id){
        return this.trows.querySelector(`[id=tab-${champ_id}]`)
    }
    fillRowData(tr, do_hidden=false){
        const id = tr.id.replace('tab-','');
        if (do_hidden || !this.hidden_ids.includes(id)){
            tr.querySelectorAll('td').forEach(td =>{
                td.innerText = table.champs.champ_data[id][td.getAttribute('col')];
            })
        }
    }
    fillTableData(trows=this.trows, do_hidden=false){
        trows.forEach(tr => { 
            this.fillRowData(tr, do_hidden);
        })
    }

    hideCol() {
        return (mutationsList, observer) => {
            mutationsList.forEach(mutation => {
                const stat = mutation.target.id.replace('select-stats-','');
                // Datatables separated thead from table_div.
                this.thead.querySelector(`[col=${stat}]`).classList.toggle('d-none');
                this.tbody.querySelectorAll(`[col=${stat}]`).forEach( col => col.classList.toggle('d-none'));
            });
        }
    }

    setPlotStat(stat){
        this.plot_data.stat = stat;
        this.plot_data.resetData(this.hidden_ids);
        this.plot_data.replot();
    }

    setChampLevel(new_level){
        const old_level = this.level;
        if (new_level == old_level) return;
        this.level = new_level;

        // Recalc data
        this.champs.processChamps(this.level);

        // Update table
        this.fillTableData(this.trows.filter(tr => !tr.classList.contains('d-none')));

        // Update plot
        if (this.plot_data){
            this.plot_data.resetData();
            this.plot_data.replot();
        }
    }

    isChampLevel = validateIntInput(1, 18, this.setChampLevel);
}
