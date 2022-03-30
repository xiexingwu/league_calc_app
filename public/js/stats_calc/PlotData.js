class PlotData {
    // Private variables to hide from Plotly
    //  so that Plotly's .clean doesn't recurse to infinity
    #plot_div;
    #table;

    constructor({plot_div='#plot_div', data={}, layout={}, config={}}){
        const xaxis = {
            showticklabels: false,
            showgrid : false,
            categoryorder: 'array',
            categoryarray: [],

            showspikes: true,
            spikemode:'across',
            spikesnap:'cursor',
        }
        const yaxis = {
            title: 'Health',
        }

        const layout_dft = {
            xaxis,
            yaxis,
            showlegend: false,
            hovermode: 'closest',
            // hoverdistance: -1,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)'
        }
        const config_dft = {
            responsive : true,
            displayModeBar: false,
        }

        Object.assign(layout_dft, layout);
        Object.assign(config_dft, config);
        Object.assign(this, 
            {
                x : [], 
                y : [], 
                text : [], 
                mode : 'markers', 
                type : 'scatter',
                stat : 'hp',
                order : 'desc',
                
                hovertemplate : ['<b>%{text}</b>', '%{y:.4~g}', '<extra></extra>'].join('<br>'),
                layout: layout_dft,
                config: config_dft,
            },
            data);
        
        if (typeof plot_div === 'string') plot_div = document.querySelector(plot_div);
        this.#plot_div = plot_div;

        this.hover_ids = [];
        this.layout_update = {};
    }

    linkTable(table){
        this.#table = table;
        this.resetData();
        this.newPlot();
        this.addChampHover();
    }

    /* Initial Plots */
    newPlot(){
        Plotly.newPlot(this.#plot_div, [this], this.layout, this.config);
    }
    addChampHover(){
        const i = 0;
        Plotly.addTraces(this.#plot_div, {
            x:[], 
            y:[],
            text:[],
            type:'scatter',
            mode:'markers+text',
            textposition:'top right',
            hovertemplate: this.hovertemplate,
            marker:{
                color:'red',
            }
        }, 1)
    }

    /* Update Plots */
    replot(){
        Object.assign(this.layout_update, {
            'xaxis.categoryarray': this.xnames.filter(x => !this.hidden_ids.includes(x)), 
            'yaxis.title':document.querySelector(`option[value=${this.stat}]`).innerText,
        });
        const data_update = {x:[this.x], y:[this.y],text:[this.text]};
        Plotly.restyle(this.#plot_div, data_update, [0]);
        Plotly.relayout(this.#plot_div, this.layout_update);
        this.updateChampHover();
    }
    updateChampHover(){
        this.hx = [...this.hover_ids]
        this.hy = [...this.hover_y]
        this.htext = [...this.hover_text]
        this.filterData(['hx','hy','htext'], i=> !this.hidden_ids.includes(this.hx[i]))
        const data_update = {x:[this.hx], y:[this.hy], text:[this.htext]}
        Plotly.restyle(this.#plot_div, data_update, [1])
    }

    /* Loading Data */
    resetData(hidden_ids=[]){
        const x = [];
        const y = [];
        const text = [];
        this.hidden_ids = hidden_ids;
        for (const id in this.#table.champs.champ_data) {
            const champ = this.#table.champs.champ_data[id];
            x.push(id);
            y.push(champ[this.stat]);
            text.push(champ.name);
        }

        this.x = x;
        this.y = y;
        this.text = text;
        this.sortByY();

        // copy order of sorted champions 
        this.xnames = [...this.x]; 

        // hide unselected champs
        this.filterData(['x','y','text'], i => !this.hidden_ids.includes(this.x[i]))

        // Separate hover and main dataset
        this.separateHoverData()
    }
    separateHoverData(){
        const hover_ranks = this.findChampInKey(this.hover_ids, 'x');
        this.hover_y = hover_ranks.map(i => this.y[i]);
        this.hover_text = hover_ranks.map(i => this.text[i]);

        this.filterData(['x','y','text'],i => !this.hover_ids.includes(this.x[i]))
    }
    mergeHoverToData(){
        this.x.push(...this.hover_ids)
        this.y.push(...this.hover_y)
        this.text.push(...this.hover_text)
    }

    /* Adding / Removing Champs */
    moveChampDataToHover(champ_id){
        this.mergeHoverToData();
        this.addChampHoverId(champ_id)
        this.separateHoverData();
    }
    moveChampHoverToData(champ_id, keep_hover=false){
        this.mergeHoverToData();
        this.removeChampHoverId(champ_id);
        this.separateHoverData();
        if (keep_hover) this.addChampHoverId(champ_id);
    }

    addChampHoverId(champ_id){
        if (this.hover_ids.includes(champ_id)) return;
        this.hover_ids.push(champ_id);
    }
    removeChampHoverId(champ_id){
        const i = this.findChampInKey(champ_id, 'hover_ids');
        if (i != -1) this.hover_ids.splice(i, 1);
    }

    addChampHiddenId(champ_id){
        if (this.hidden_ids.includes(champ_id)) return;
        this.hidden_ids.push(champ_id);
    }
    removeChampHiddenId(champ_id){
        const i = this.findChampInKey(champ_id, 'hidden_ids');
        if (i != -1) this.hidden_ids.splice(i, 1);
    }
 
    addChamp(champ_id){
        // Update hidden
        this.removeChampHiddenId(champ_id);

        // If already exists for some reason, first remove then add again
        if (this.x.includes(champ_id)) {
            console.log(`${champ_id} will be removed before adding in again`)
            this.removeChamp(champ_id);
        }

        const champ = this.#table.champs.champ_data[champ_id];
        const champ_name = champ.name;
        const val = champ[this.stat]

        this.x.push(champ_id);
        this.y.push(val);
        this.text.push(champ_name);

        // Restore hover if previously set
        if (this.hover_ids.includes(champ_id)){
        // if (tr.classList.contains('clicked')){
            this.moveChampDataToHover(champ_id);
        }
    }
    removeChamp(champ_id){
        // Update hidden
        this.addChampHiddenId(champ_id)

        // Check hover before data
        if (this.hover_ids.includes(champ_id)) this.moveChampHoverToData(champ_id, true);

        const rank = this.findChampInKey(champ_id, 'x');
        if (rank == -1) return;

        this.x.splice(rank, 1);
        this.y.splice(rank, 1);
        this.text.splice(rank, 1);
    }

    /* Finders */
    findRankInY(val){
        let rank = 0;
            while (rank < this.y.length){
                if ((this.order == 'desc' && val > this.y[rank]) ||
                    (this.order == 'asc'  && val < this.y[rank])){
                        break;
                }
                rank++;
            }
        return rank
    }
    findChampInKey(champ_id, key='x'){
        // Single champ, just find rank
        if (typeof champ_id == 'string') return this[key].findIndex(id => champ_id == id);
        // Array of champs, recurse for each champ
        if (champ_id.length > 0) return champ_id.map(id => this.findChampInKey(id, key))
        if (champ_id.length == 0) return []
        throw `findChampInKey received input ${champ_id}`
    }

    /* Sorting and Filtering */
    sortAllBy(x='x',y='y',order='desc'){
        this.order = order; // Track current sorting order
        let up = 1;
        switch (order){
            case 'desc':
                up = 1;
                break;
            case 'asc':
                up = -1;
                break;
            default:
                throw `Unexpected sort method ${order}`
        }
        
        const perm = [...Array(this[x].length).keys()]
        .sort((a,b) => {
            if (this[x][b] > this[x][a] ){
                return up
            }else{
                return -1 * up
            }
        })
        
        this[x] = perm.map(a => this[x][a])
        this[y] = perm.map(a => this[y][a])
        this.text = perm.map(a => this.text[a])

    }

    sortByX(order=this.order) {this.sortAllBy('x','y',order)};
    sortByY(order=this.order) {this.sortAllBy('y','x',order)};

    filterData(keys, passRule){
        const indices = [...Array(this[keys[0]].length).keys()].filter(passRule);
        keys.forEach(key => {
            this[key] = indices.map(i => this[key][i]);
        });
    }

}

