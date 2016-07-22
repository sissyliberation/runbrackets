var express = require('express'); 
var request = require('request');
var bodyParser = require('body-parser');
// var mongoose = require('mongoose');
var app = express();

console.log('SERVER STARTING');

var port = process.env.PORT || 8080;

app.set('view engine', 'ejs');

// parse application/json
app.use(bodyParser.json());                        

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static(__dirname));

// LIST ALL TOURNAMENTS
app.get('/getTournaments/', function(req, res) {
  console.log();
  console.log('GET TOURNAMENTS');

  var api_key = req.query.api_key;

  var url = 'https://api.challonge.com/v1/tournaments.json?api_key=';
  url += api_key;
  request.get(url, function(error, response, body) {
      res.send(body);
  });
});

// LIST ALL TOURNAMENT PARTICIPANTS
app.get('/getTournamentParticipants/', function(req, res) {
  console.log();
  console.log('GET TOURNAMENT PARTICIPANTS');
  // https://api.challonge.com/v1/tournaments/{tournament}/participants.{json|xml}

  var api_key = req.query.api_key;
  var tournament_url = req.query.tournament_url;

  var url = 'https://api.challonge.com/v1/tournaments/' + tournament_url + '/participants.json?api_key=';
  url += api_key;

  request.get(url, function(error, response, body) {
    res.send(body);
  });
});

// LIST ALL TOURNAMENT MATCHES
app.get('/getMatches/', function(req, res) {
  console.log();
  console.log('GET TOURNAMENT MATCHES');
  // https://api.challonge.com/v1/tournaments/{tournament}/matches.{json|xml}

  var api_key = req.query.api_key;
  var tournament_url = req.query.tournament_url;

  console.log('hello');
  console.log(tournament_url);

  var url = 'https://api.challonge.com/v1/tournaments/' + tournament_url + '/matches.json?api_key=';
  url += api_key;

  request.get(url, function(error, response, body) {
    res.send(body);
  });
});

// UPDATE MATCH
app.post('/postMatchResults/', function(req, res) {
  console.log();
  console.log('UPDATE MATCH');
  

  console.log(req.body);
  console.log('----');

  var api_key = req.body.data.api_key;
  var tournament_url = req.body.data.tournament_url;

  // var match = JSON.parse(req.body.match);
  var match_id = req.body.data.match_id;

  var score = req.body.data.score;

  var winner_id = req.body.data.winner_id || '';

  console.log('hello');
  console.log(tournament_url);


  var url = 'https://api.challonge.com/v1/tournaments/' + tournament_url + '/matches/' + match_id + '.json?api_key=';
  url += api_key;

  console.log('HERE HERE HERE HERE');
  console.log(url);
  console.log('HERE HERE HERE HERE');


  // url += '&scores_csv='+score;

  request({
    url: url, method: 'PUT', json: {
      "match": {
        "scores_csv": score,
        "winner_id": winner_id
      }
    }
  }, function(error, response, body) {
    console.log(error);
    console.log('-----------------------------------------');
    console.log(response);
    console.log('****************************************');
    console.log(body);

    res.send(body);
  });

});


app.listen(port);

console.log('SERVER STARTED');