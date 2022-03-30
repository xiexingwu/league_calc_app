const path = require('path');
const express = require('express');
const ejs = require('ejs');

PORT = process.env.PORT || 3000

/* Loading data */
const {champ_data} = require('./data/champ_data.json');
const {item_data, tierlist} = require('./data/item_data.json');
const utils = require('./utils.js');

// champ_data.sort((c1, c2) => (c1.name > c2.name ? 1 : -1))

/* APP */
const app = express();
// const debug = {offcanvas:true};

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname,"public")));

app.use('/bs',express.static(path.join(__dirname,"node_modules/bootstrap/dist/css")))
app.use('/bs',express.static(path.join(__dirname,"node_modules/bootstrap/dist/js")))
app.use('/plotly',express.static(path.join(__dirname,"node_modules/plotly.js/dist")))
app.use('/jquery',express.static(path.join(__dirname,"node_modules/jquery/dist")))
app.use('/dt',express.static(path.join(__dirname,"node_modules/datatables.net-dt/css")))
app.use('/images',express.static(path.join(__dirname,"node_modules/datatables.net-dt/images")))
app.use('/dt',express.static(path.join(__dirname,"node_modules/datatables.net/js")))
app.use('/mathjs',express.static(path.join(__dirname,"node_modules/mathjs/lib/browser")))

/* Handle favicon.ico */
app.use( function(req, res, next) {
  if (req.originalUrl && req.originalUrl.split("/").pop() === 'favicon.ico') {
    return res.sendStatus(204);
  }
  return next();
});

/* Serve champ/item data */
app.use('/data/:data_type(champ|item)_data.json', function(req, res){
  const filename = req.params.data_type + "_data.json";
  res.sendFile(path.join(__dirname, "data/", filename))
})


/* routing */
// stats_calc
// damage_calc
app.get("/:calc_type(stats|damage)_calc", function (req, res) {
  const page = req.params.calc_type + "_calc"
  res.render(page, {
    champ_data, 
    item_data, 
    tierlist, 

    utils, 
    req,

    // debug,
  });
});

app.get("/:help(help)", function (req, res) {
  res.render("help", {req});
});

app.get("/", function (req, res) {
  res.redirect('/stats_calc');
});


app.use((req, res) => {res.sendStatus(404)})

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}...`));

