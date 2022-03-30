/* Input utility */
// bootstrap uses input.checked to toggle switches/radio
// but MutationObserver can only monitor changes in input.getAttribute('checked')
// So whenever we play with switches, we have to set both.
//      When setting 1 input.checked=true, bootstrap automatically sets the others false, but doesn't .setAttribute
const last_radio = 'last-radio';

const obs_select_config = {
    attributes: true,
    attributeFilter: ['checked'],
    subtree: true,
};
HTMLInputElement.prototype.getPeers = function () {return document.querySelectorAll(`input[name=${this.name}]`)};
HTMLInputElement.prototype.setPeersDisabled = function(peers, disabled){
    peers.forEach(peer =>{if (peer != this){
        if (typeof disabled == 'boolean'){
            peer.disabled = disabled;
        } else {
            peer.setAttribute('disabled', disabled);
        }
    }})
}

HTMLInputElement.prototype.hasChecked = function () {return this.hasAttribute('checked')};
HTMLInputElement.prototype.setChecked = function (check=!this.checked, ignore_disable=false){
    if (!ignore_disable && this.disabled) return;
    /* Handle radio logic.
        Don't consider check==false, 
        since in that case we're unchecking all radios, 
        and standard checkbox logic applies
    */
    if (this.type == 'radio'){
        /* custom attribute 'last-radio' to track last radio clicked.
            Unique to one radio in a [name] group.
        */
        if (!check){
            this.removeAttribute(last_radio);
        } else {
            if (!this.hasAttribute(last_radio)){
                // off -> on
                this.getPeers().forEach(peer => (this != peer) ? peer.setChecked(false) : null);
                // this.getPeers().forEach(peer => peer.removeAttribute(last_radio));
                this.setAttribute(last_radio,'');
            }else{
                // on -> off (just clear all)
                this.removeAttribute(last_radio);
                this.getPeers().forEach(peer => peer.setChecked(false));
                return;
            }
        }
    }

    /* Sync this.checked & attribute [checked] */
    if (check && !this.hasChecked()){
        this.setAttribute('checked','');
    }else if(!check && this.hasChecked()) {
        this.removeAttribute('checked');
    }
    this.checked = check;
}



/* Inputs utility. 
    Delegate mouse-clicks in a container to the corresponding input box */
function checkChildInput(evt){
    /* Error handling */
    if (evt.type != 'click') throw `checkChildInput only considers click events, not ${evt.type} events.`;
    if (!evt.currentTarget.querySelector(':scope > .form-check')) {
        console.log(evt.currentTarget);
        throw `checkChildInput must be applied to the direct parent of a .form-check element.`
    }

    let tgt = evt.target;
    // Ignore if we clicked on the container itself
    if (tgt == evt.currentTarget){
        return
    }

    // If checkbox clicked directly
    if (Object.prototype.hasOwnProperty.call(tgt, 'classList') || tgt.classList.contains('form-check-input')){
        tgt.setChecked(tgt.checked);
        evt.stopPropagation();
        return
    }


    // Something else clicked... process
    if (evt.eventPhase == Event.CAPTURING_PHASE) {
        evt.preventDefault(); // only stops bs-label interacting, not bs-checkbox itself?
        return;
    }else if(evt.eventPhase == Event.BUBBLING_PHASE){
        // First traverse to one level below container (should be same level as a .form-check)
        let parent;
        while ((parent = tgt.parentElement) != evt.currentTarget){
            tgt = parent;
        }

        // If not .form-check then ignore
        if (Object.prototype.hasOwnProperty.call(tgt, 'classList') || !tgt.classList.contains('form-check')){
            return;
        }

        const inputs = tgt.querySelectorAll('input.form-check-input');
        if (inputs.length != 1){
            console.log(tgt);
            throw `.form-check should only have 1 input.form-check-input.`;
        }
        const input = inputs[0];

        // Ignore not radio/checkbox
        if (!['checkbox','radio'].includes(input.type)){
            return; // ignore if not checkbox/radio
        } 

        input.setChecked();
        evt.stopPropagation();
    }

}

/* (Un)select all button - Listener factory */
function selectAllListener (selectAllTargets) {
    return (evt) => {
        const nclicks = evt.target.attributes.nclicks;
        nclicks.value = parseInt(nclicks.value)+1;

        if (evt.target.getAttribute('nclicks') % 2){
            evt.target.innerText = 'Select All';
            selectAllTargets.forEach(target => {
                target.setChecked(false);
            });
        }else{
            evt.target.innerText = 'Unselect All';
            selectAllTargets.forEach(target => {
                target.setChecked(true);
            });
        }
    }
}

function validateIntInput(min, max, submit_value){
    return (evt) =>{
        const charCode = (evt.which) ? evt.which : evt.keyCode;
        if (charCode == 13) return submit_value(evt.target.value); // Enter key

        const digit = charCode - 48; // ASCII 48 -> 0
        if (digit < 0 || digit > 9) return evt.preventDefault();

        const num = parseInt(evt.target.value+digit);
        if (num < min || num > max) return evt.preventDefault();

        return num;
    }

}