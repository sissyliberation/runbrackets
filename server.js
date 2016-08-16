var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');

var app = express();
var port = process.env.PORT || 8080;

var root_public = __dirname + '/public';
var node_modules = __dirname + '/node_modules';

CHALLONGE_API_KEY = process.env.CHALLONGE_API_KEY;

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(root_public));
app.use('/node_modules', express.static(node_modules));
app.use('/query', require('./routes/queries'));

app.get('*', function(req, res) {
  res.sendFile('./index.html', {root: root_public});
});

app.listen(port);

console.log('Server started on port: ' + port);