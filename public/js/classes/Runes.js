class Runes{
    constructor(rune_cart='#rune-cart-1'){
        if (typeof rune_cart == 'string') rune_cart = document.querySelector(rune_cart);
        this.rune_cart = rune_cart;

        const drop_p = this.rune_cart.querySelector(`[id=dropdown-primary]`);
        const drop_s = this.rune_cart.querySelector(`[id=dropdown-secondary]`);
        this.primary = new RuneSelector(drop_p, true);
        this.secondary = new RuneSelector(drop_s, false);
        this.initListener()
    }
    collectStats(){
        // Get stats from runes
        const stats = {};
        this.primary.collectStats(stats);
        this.secondary.collectStats(stats);
        return stats;
    }
    initListener(){
        const rune_list = [this.primary, this.secondary];
        rune_list.forEach(rune => 
            rune.menu.addEventListener('click',  (evt) => {
                let runetree = evt.target;
                if (runetree.tagName == 'IMG'){
                    runetree = evt.path[1];    
                }
                if (runetree.tagName == 'UL') return;
                if (runetree.tagName != 'SPAN'){
                    console.log(evt);
                    throw `tagName = ${runetree.tagName}: not a span?`
                }
                rune.rune = rune.getOptionRune(runetree);
                if (rune === this.primary){
                    this.updateSecondaryTree()
                }
            })
        )
    }

    updateSecondaryTree(){
        const rune = this.primary.rune;
        const rune_s = this.secondary.rune;
        this.secondary.options.forEach(opt => opt.classList.remove('d-none'));
        this.secondary.findOptionByRune(rune).classList.add('d-none')
        
        if (rune == rune_s){
            const random_runetree = this.secondary.menu.querySelector(':not(.d-none)');
            this.secondary.rune = this.secondary.getOptionRune(random_runetree);
        }
    }

}


class RuneSelector{
    constructor(drop){
        this.drop = drop;
        this.btn = drop.querySelector('.dropdown-toggle');
        this.menu = drop.querySelector('.dropdown-menu');
        this.options = Array.from(this.menu.children);
    }
    collectStats(stats){
        // collect stats of runes in the input stats object.
    }


    getOptionRune(runetree){
        if (!runetree) return '';
        return runetree.id.replace('dropdown-','').replace('secondary-','').replace('primary-','');
    }
    
    findOptionByRune(rune){
        if (!rune) throw 'Attempting to find option by empty rune';
        return this.options.filter(opt => opt.id.includes(rune))[0]
    }

    get rune(){
        return this.getOptionRune(this.selected_runetree)
    }

    set rune(rune){
        if (!rune){
            const old_tree = this.selected_runetree;
            if (old_tree){
                this.menu.append(old_tree);
            }
        }else{
            this.selected_runetree = this.findOptionByRune(rune);
        }
    }

    get selected_runetree(){
        return this.btn.children[0];
    }

    set selected_runetree(runetree){
        const old_tree = this.selected_runetree;
        if (old_tree){
            this.menu.append(old_tree);
        }
        this.btn.append(runetree);
    }
}




