
var request = require('request');
var Tournament = require('./tournament.model');

exports.index = function(req, res) {

  var api_key = req.query.api_key;
  var subdomain = req.query.subdomain;
  var state = req.query.state;

  var url = 'https://api.challonge.com/v1/tournaments.json?api_key=';
  url += api_key;

  if (subdomain) {
    url += '&subdomain=' + subdomain;
  }

  if (state) {
    url += '&state=' + state;
  }

  request.get(url, function (error, response, body) {
    return res.send(body);
  });
};

exports.show = function(req, res) {
  var api_key = req.query.api_key || process.env.CHALLONGE_API_KEY;
  var tournament_url = req.query.tournament_url;
  var subdomain = req.query.subdomain;

  if (subdomain) {
    tournament_url = subdomain + '-' + tournament_url;
  }

  var url = 'https://api.challonge.com/v1/tournaments/' + tournament_url + '.json?api_key=';
  url += api_key;

  request.get(url, function (error, response, body) {
    return res.send(body);
  });
};

exports.showAttachments = function(req, res) {

  var api_key = req.query.api_key || process.env.CHALLONGE_API_KEY;
  var tournament_url = req.query.tournament_url;
  var subdomain = req.query.subdomain;

  if (subdomain) {
    tournament_url = subdomain + '-' + tournament_url;
  }

  var url = 'https://api.challonge.com/v1/tournaments/' + tournament_url + '.json?api_key=';
  url += api_key;

  request({
    url: url, method: 'PUT', json: {
      "tournament": {
        "accept_attachments": true
      }
    }
  }, function (error, response, body) {
    res.send(body);
  });

};

exports.getParticipants = function(req, res) {

  var api_key = req.query.api_key || process.env.CHALLONGE_API_KEY;
  var tournament_url = req.query.tournament_url;
  var subdomain = req.query.subdomain;

  if (subdomain) {
    tournament_url = subdomain + '-' + tournament_url;
  }

  var url = 'https://api.challonge.com/v1/tournaments/' + tournament_url + '/participants.json?api_key=';
  url += api_key;

  request.get(url, function (error, response, body) {
    res.send(body);
  });

};

exports.getMatches = function(req, res) {

  var api_key = req.query.api_key || process.env.CHALLONGE_API_KEY;
  var tournament_url = req.query.tournament_url;
  var subdomain = req.query.subdomain;

  if (subdomain) {
    tournament_url = subdomain + '-' + tournament_url;
  }

  var url = 'https://api.challonge.com/v1/tournaments/' + tournament_url + '/matches.json?api_key=';
  url += api_key;

  request.get(url, function (error, response, body) {
    res.send(body);
  });

};

exports.getMatchStation = function(req, res) {

  var api_key = req.query.api_key || process.env.CHALLONGE_API_KEY;
  var tournament_url = req.query.tournament_url;
  var match_id = req.query.match_id;
  var subdomain = req.query.subdomain;

  if (subdomain) {
    tournament_url = subdomain + '-' + tournament_url;
  }

  var url = 'https://api.challonge.com/v1/tournaments/' + tournament_url + '/matches/' + match_id + '.json?api_key=';
  url += api_key;
  url += '&include_attachments=1';

  request.get(url, function (error, response, body) {
    res.send(body);
  });

};

exports.postMatchStation = function(req, res) {
  var api_key = req.body.data.api_key;
  var tournament_url = req.body.data.tournament_url;
  var match_id = req.body.data.match_id;
  var match_station = req.body.data.match_station || '';
  var station_id = req.body.data.station_id;
  var subdomain = req.body.data.subdomain;
  var get_method = req.body.data.get_method;

  if (subdomain) {
    tournament_url = subdomain + '-' + tournament_url;
  }

  var url = 'https://api.challonge.com/v1/tournaments/' + tournament_url + '/matches/' + match_id + '/attachments';

  if (station_id) {
    url += '/' + station_id;
  }

  url += '.json?api_key=';
  url += api_key;

  request({
    url: url, method: get_method, json: {
      "match_attachment": {
        "description": 'station-' + match_station
      }
    }
  }, function (error, response, body) {
    res.send(body);
  });

};

exports.postMatchResults = function(req, res) {
  var api_key = req.body.data.api_key;
  var tournament_url = req.body.data.tournament_url;
  var match_id = req.body.data.match_id;
  var score = req.body.data.score;
  var winner_id = req.body.data.winner_id || '';
  var subdomain = req.body.data.subdomain;

  if (subdomain) {
    tournament_url = subdomain + '-' + tournament_url;
  }

  var url = 'https://api.challonge.com/v1/tournaments/' + tournament_url + '/matches/' + match_id + '.json?api_key=';
  url += api_key;

  request({
    url: url, method: 'PUT', json: {
      "match": {
        "scores_csv": score,
        "winner_id": winner_id
      }
    }
  }, function (error, response, body) {
    res.send(body);
  });

};

function handleError(res, err) {
  return res.status(500).send(err);
}