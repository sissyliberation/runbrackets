var express = require('express'); 
var request = require('request');
var bodyParser = require('body-parser');

var app = express();

console.log('SERVER STARTING');

var port = process.env.PORT || 8080;

app.set('view engine', 'ejs');

app.use(bodyParser.json());                        
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

  var api_key        = req.query.api_key;
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

  var api_key        = req.query.api_key;
  var tournament_url = req.query.tournament_url;

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
  
  var api_key        = req.body.data.api_key;
  var tournament_url = req.body.data.tournament_url;
  var match_id       = req.body.data.match_id;
  var score          = req.body.data.score;
  var winner_id      = req.body.data.winner_id || '';

  var url = 'https://api.challonge.com/v1/tournaments/' + tournament_url + '/matches/' + match_id + '.json?api_key=';
  url += api_key;

  request({
    url: url, method: 'PUT', json: {
      "match": {
        "scores_csv": score,
        "winner_id": winner_id
      }
    }
  }, function(error, response, body) {
    res.send(body);
  });

});

app.listen(port);

console.log('SERVER STARTED');