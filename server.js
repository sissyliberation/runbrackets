var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');

var app = express();
var port = process.env.PORT || 8080;
CHALLONGE_API_KEY = process.env.CHALLONGE_API_KEY || 'INSERT API KEY HERE';

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname));

app.use('/query', require('./routes/queries'));

app.listen(port);

console.log('Server started on port: ' + port);