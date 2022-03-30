/* Find all inputs and delegate interaction to parent form div */
const formchecks = document.querySelectorAll('.form-check')

const form_groups = [];
for (const div of formchecks){
    if (!form_groups.includes(form_group = div.parentNode)) 
        form_groups.push(form_group);
}

form_groups.forEach(form_group =>{
    form_group.addEventListener('click', checkChildInput, true); // prevent default
    form_group.addEventListener('click', checkChildInput, false); 
})


/* Unclickable label content (e.g. images, text) */
// const labels_children = document.querySelectorAll('label.form-check-label>*');
// labels_children.forEach(element => element.classList.add('pe-none'));
