const collapse_champ_btn = document.querySelector('#collapse-champ-btn');
const collapse_item_btn = document.querySelector('#collapse-item-btn');
const collapse_champ = document.querySelector('#collapse-champ');
const collapse_item = document.querySelector('#collapse-item');

const champ_selector = document.querySelector('#champ-selector');
const item_selector = document.querySelector('#item-selector');
const collapseBtnArr = [collapse_champ_btn, collapse_item_btn];
const collapseArr = [collapse_champ, collapse_item];

const champ_inputs = collapse_champ.querySelectorAll('input[id*=select-]');
const select_champ_btn = document.querySelector('#select-champ-btn');



/* Style collapse buttons in card headers */
document.querySelectorAll('.card-header > button[data-bs-toggle=collapse]')
    .forEach(btn => btn.classList.add(
        'fs-6',
        'fw-bold',
        'text-dark',
        'text-decoration-none',
        'd-block',
        'mx-auto',
        'shadow-none',
        'py-0',
    )
)

/* Collapse selectors */
collapseBtnArr.forEach(collapse_btn => {
    collapse_btn.addEventListener('click', showOneCollapseOnly);    
});

select_champ_btn.addEventListener('click', function(evt){
    const visible = Array.from(champ_inputs).filter(input => !input.parentElement.classList.contains('d-none'));
    if (visible.some(x=> x.checked)){
        visible.forEach(x=> x.setChecked(false));
        this.innerText = 'Select All';
    }else{
        visible.forEach(x=> x.setChecked(true));
        this.innerText = 'Unselect All';
    }
})


function showOneCollapseOnly(evt){
    const collapse_target = document.getElementById(evt.target.getAttribute('data-bs-target'));
    collapseArr.forEach(collapse => {
        if (collapse != collapse_target){
            collapse.classList.remove('show');
        }
    })
}

/* Search champions */
document.getElementById('champ-search').addEventListener('submit', (e) => (e.preventDefault()));
document.getElementById('champ-search').addEventListener('input', function searchChamps(evt){
    const value = evt.target.value.replace(/^\s+/, '').replace(/\s+$/, '');
    if (value == '') {
        champ_selector.querySelectorAll(`.form-check`).forEach(x=>x.classList.remove('d-none'));
        return;
    }

    const inputs_to_show = [];

    champ_inputs.forEach(input => {
        const id = input.id.replace('select-','');
        if (champ_data[id].tags.some(tag => tag.includes(value)))
            inputs_to_show.push(input);
    })

    champ_inputs.forEach(input => {
        if (inputs_to_show.includes(input)) {
            input.parentElement.classList.remove('d-none')
        }else{
            input.parentElement.classList.add('d-none')
        }
    })

    select_champ_btn.innerText = inputs_to_show.some(x=> x.checked) 
        ? 'Unselect All'
        : 'Select All';

})