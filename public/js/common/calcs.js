const growth_stats = Array.from(document.querySelectorAll('input[name=select-growthstats]'))
    .map(input => input.id.replace('select-stats-',''))

/* Calcs */
function calcAS(ratio, bonus, level=18){
    // Calculate final attack speed
    const base = ratio*(1+bonus);
    const growth_coeff = (level-1) * (.7025 + .0175 * (level-1));
    return  + ratio*growth_coeff
}

function calcStat(base, growth, level=1){
    // return final stat at LEVEL
    const growth_coeff = (level-1) * (.7025 + .0175 * (level-1));
    return base + growth*growth_coeff
}

function calcBase(final, growth, level=18){
    // return base stat at level 1 given final stat at LEVEL
    const growth_coeff = (level-1) * (.7025 + .0175 * (level-1));
    return final - growth*growth_coeff
}
function calcCDR(ah){
    return 100/(ah+100)
}
function calcDR(res){
    return res < 0 ? 2-100/(100-res) : 100/(100+res)
}
function calcAdditive(base){
    const adds = Array.from(arguments).slice(1);
    return base * adds.reduce((a,b) => a+b, 1);
}
function calcMultiplicative(base){
    const adds = Array.from(arguments).slice(1);
    return base * adds.reduce((a,b) => a*b, 1);
}

// function recurseManaAp({
//     mp: a, // base champ mana at level X
//     mana: b, // flat mana from explicit item stats
//     ryze: d=0, // is ryze
//     ap: e, // flat ap from explicit item stats
//     awe: f=0, //bonus mana->AP scaling. 3% for archangle, 5% for seraph
//     dcap: g=0, //have dcap
//     watchstone: h=0, //have vigilant watchstone
// }){
//     const c = f > 0; // boolean flag for seraph/archangel

//     const denom = (100*a*c*f + 100*b*c*f + 35*a*c*f*g + 12*a*c*f*h + 35*b*c*f*g + 12*b*c*f*h + 200*a*c*d*f + 200*b*c*d*f + 70*a*c*d*f*g + 24*a*c*d*f*h + 70*b*c*d*f*g + 24*b*c*d*f*h - 400000);
//     const num_mana = -((a + b)*(20000*c + 100*c*e + 200*d*e + 35*c*e*g + 12*c*e*h + 70*d*e*g + 24*d*e*h - 100*a*c*f - 35*a*c*f*g - 12*a*c*f*h - 200*a*c*d*f - 70*a*c*d*f*g - 24*a*c*d*f*h + 400000));
//     const num_ap = -(200*(2000*e + 700*e*g + 240*e*h + 2000*b*c*f + 100*a*c*f + 100*b*c*f + 35*a*c*f*g + 12*a*c*f*h + 35*b*c*f*g + 12*b*c*f*h + 700*b*c*f*g + 240*b*c*f*h));

//     return {
//         ap: num_ap / denom,
//         mana: num_mana / denom,
//     }
// }

// /* Tests */
// // Ryze: Level 13 + Seraph + Dcap + Vigilant watchstone
// // expected: Mana 2576, AP 383
// const ryze_13_all = {mp: 1066.5, mana: 860, ryze: 1, ap: 120+65, awe: 0.05, dcap: 1, watchstone: 1};

