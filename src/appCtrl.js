(function () {
  'use strict';

  var app = angular.module('app');
  app.controller('appCtrl', function($scope, $http, localStorageService, $interval) {


    $scope.Math = window.Math;

    $scope.activeTournament = '';
    $scope.matches = '';
    $scope.match_ids = {};
    $scope.currentMatch = {};

    $scope.participants = {};
    $scope.stations = {};

    $scope.is_loading = false;
    $scope.ready = false;

    $scope.is_organizer = false;

    $scope.tournamentFilters = [{
      "name": "In Progress",
      "value": "in_progress"
    }, {
      "name": "Completed",
      "value": "ended"
    }, {
      "name": "Pending",
      "value": "ended"
    }, {
      "name": "All",
      "value": "all"
    }];

    $scope.credentials = {
      'organizer': {
        'tournament_filter': $scope.tournamentFilters[0]
      },
      'participant': {

      },
      'api_key': '',
      'subdomain': '',
      'hide_completed': localStorageService.get('hide_completed'),
      'hide_stations': localStorageService.get('hide_stations'),

    };

    $scope.getCredentials = function(clicked, type) {

      if(type == 'organizer') {
        $scope.credentials.organizer.api_key = localStorageService.get('api_key');
        $scope.credentials.organizer.subdomain = localStorageService.get('subdomain');
        if (!$scope.credentials.organizer.api_key) {
          $scope.ready = false;
        }
        else {
          $scope.ready = true;
          $scope.confirmed = clicked;
        }
      }
      else if (type == 'participant') {

        $scope.credentials.full_challonge_url = localStorageService.get('full_challonge_url');
        $scope.ready = true;
        $scope.confirmed = clicked;

        if( $scope.confirmed) {
          $scope.activateTournament();
        }
      }
    };

    $scope.setCredentials = function(type) {

      if(type == 'organizer') {
        $scope.is_organizer = true;
        localStorageService.set('api_key',   $scope.credentials.organizer.api_key);
        localStorageService.set('subdomain', $scope.credentials.organizer.subdomain);
        $scope.getCredentials(true, 'organizer');
        $scope.getActiveTournaments();
      }
      else if (type == 'participant') {
        $scope.is_organizer = false;

        localStorageService.set('full_challonge_url',  $scope.credentials.full_challonge_url);
 
        var n = $scope.credentials.full_challonge_url.search("://");
        if (n) {
          $scope.credentials.full_challonge_url = $scope.credentials.full_challonge_url.substring(n+3);
        }

        var split_slash = $scope.credentials.full_challonge_url.split('/');
        $scope.credentials.participant.tournament_url = split_slash[split_slash.length - 1];

        var split_dot = $scope.credentials.full_challonge_url.split('.');

        if (split_dot.length >2) {
          $scope.credentials.participant.subdomain = split_dot[0];
        }
        else {
          $scope.credentials.participant.subdomain = '';
        }

        $scope.getCredentials(true, 'participant');
      }
    };

    $scope.hideCompletedMatches = function() {
      localStorageService.set('hide_completed', $scope.credentials.hide_completed);
    };
    $scope.hideStations = function() {
      localStorageService.set('hide_stations', $scope.credentials.hide_stations);
    };

    $scope.getActiveTournaments = function(filter) {

      console.log('hello');

      $scope.is_loading = true;

      var state = 'in_progress';

      if ($scope.credentials.organizer.tournament_filter && 'value' in $scope.credentials.organizer.tournament_filter) {
        state = $scope.credentials.organizer.tournament_filter.value;
      }

      $http.get("getTournaments/", {
        params: {
          "api_key" : $scope.credentials.organizer.api_key,
          "subdomain" : $scope.credentials.organizer.subdomain,
          "state" : state
        }
      })
      .success(function (data, status) {
        $scope.tournaments = data;
        $scope.is_loading = false;
      })
      .error(function (data, status) {
        // console.log(data);
      });
    }; 

    $scope.selectTournament = function(tournament) {
      $scope.activeTournament = tournament;
      $scope.activateTournament();
    };

    $scope.activateTournament = function() {
      if ($scope.is_organizer) {
        $scope.tournamentAttachments();
        $scope.getTournamentParticipants();
      }
      else {
        $scope.getTournamentParticipants();
        $interval(function () {
          $scope.getTournamentParticipants(false);
        }, 30000);
      }
    }

    $scope.tournamentAttachments = function() {
      $http.get("tournamentAttachments/", {
        params: {
          "api_key" : $scope.credentials.organizer.api_key,
          "subdomain" : $scope.credentials.subdomain,
          "tournament_url" : $scope.activeTournament.tournament.url
        }
      });
    };

    $scope.getTournamentParticipants = function(reload) {
      console.log(reload);
      $scope.is_loading = reload;

      var api_key;
      var subdomain;
      var tournament_url;

      if( $scope.is_organizer ) {
        api_key        = $scope.credentials.organizer.api_key;
        subdomain      = $scope.credentials.organizer.subdomain;
        tournament_url = $scope.activeTournament.tournament.url;
      }
      else {
        subdomain      = $scope.credentials.participant.subdomain;
        tournament_url = $scope.credentials.participant.tournament_url;
      }
      $http.get("getTournamentParticipants/", {
        params: {
          "api_key"        : api_key,
          "subdomain"      : subdomain,
          "tournament_url" : tournament_url,
          "is_organizer"   : $scope.is_organizer
        }
      })
      .success(function (data, status) {
        var participants = data;

        for(var i = 0; i < participants.length; i++) {
          $scope.participants[participants[i].participant.id] = participants[i].participant.name;
        }

        $scope.getTournamentMatches(reload);
      })
      .error(function (data, status) {
       console.log(data);
      });
    };

    $scope.getTournamentMatches = function(reload) {
      $scope.is_loading = reload;

      var api_key;
      var subdomain;
      var tournament_url;

      if( $scope.is_organizer ) {
        api_key        = $scope.credentials.organizer.api_key;
        subdomain      = $scope.credentials.organizer.subdomain;
        tournament_url = $scope.activeTournament.tournament.url;
      }
      else {
        subdomain      = $scope.credentials.participant.subdomain;
        tournament_url = $scope.credentials.participant.tournament_url;
      }

      $http.get("getMatches/", {
        params: {
          "api_key"        : api_key,
          "subdomain"      : subdomain,
          "tournament_url" : tournament_url,
          "is_organizer"   : $scope.is_organizer
        }
      })
      .success(function (data, status) {
        $scope.matches = data;
        $scope.match_ids = {};

        // store match ids to determine winner
        angular.forEach($scope.matches, function(value) {
          $scope.match_ids[value.match.id] = {
            'id': value.match.identifier,
            'round': value.match.round
          };

          if (value.match.attachment_count) {
           $scope.getMatchStation(value);
          }
        });

        $scope.is_loading = false;
      })
      .error(function (data, status) {
       console.log(data);
      });
    };

    $scope.editMatch = function(match) {
      // there really isn't anything you can do on a match that is pending, at least now
      if($scope.is_organizer && match.match.state != 'pending') {
        $scope.currentMatch = match;
        if($scope.currentMatch.match.scores_csv) {
          var scores = $scope.currentMatch.match.scores_csv.split('-');
          $scope.currentMatch.match.player1_score = parseInt(scores[0]) || 0;
          $scope.currentMatch.match.player2_score = parseInt(scores[1]) || 0;
        }
        $('#matchModal').modal();
      }
    };

    $scope.postMatchResults = function() {
      var p1_score = $scope.currentMatch.match.player1_score || 0;
      var p2_score = $scope.currentMatch.match.player2_score || 0;
      var score = '' + p1_score + '-' + p2_score;

      var match_station = $scope.currentMatch.match.station || '';

      $http.post("postMatchResults/", {
        data: {
          "api_key" : $scope.credentials.organizer.api_key,
          "subdomain" : $scope.credentials.organizer.subdomain,
          "tournament_url" : $scope.activeTournament.tournament.url,
          "match_id": $scope.currentMatch.match.id,
          "match_station": match_station,
          "score": score,
          'winner_id': $scope.currentMatch.match.winner_id
        }
      })
      .then(
       function(response){
         // $scope.setStation($scope.currentMatch.match.id, '');
         $scope.getTournamentMatches(false);
         $('#matchModal').modal('hide');
       }, 
       function(response){
        console.log(response);
       });
    };

    $scope.getMatchStation = function(match) {

      var api_key;
      var subdomain;
      var tournament_url;

      if( $scope.is_organizer ) {
        api_key        = $scope.credentials.organizer.api_key;
        subdomain      = $scope.credentials.organizer.subdomain;
        tournament_url = $scope.activeTournament.tournament.url;
      }
      else {
        subdomain      = $scope.credentials.participant.subdomain;
        tournament_url = $scope.credentials.participant.tournament_url;
      }


      $http.get("getMatchStation/", {
        params: {
          "api_key"        : api_key,
          "subdomain"      : subdomain,
          "tournament_url" : tournament_url,
          "match_id"       : match.match.id,
          "is_organizer"   : $scope.is_organizer
        }
      })
      .then(
       function(response) {

        if (!response.data.match) {
          return;
        }

        var match_data = response.data.match;

        var station = '';
        var id = '';

        for(var i = 0; i < match_data.attachment_count; ++i) {
          if(match_data.attachments[i].match_attachment.description.substring(0,8) == 'station ') {
            match.match.station = match_data.attachments[i].match_attachment.description.substring(8);
            match.match.station_id = match_data.attachments[i].match_attachment.id;
          }
        }
       }, 
       function(response){
        console.log(response);
       });
    };

    $scope.updateMatchStation = function(match, station) {

      if ($scope.is_organizer) {
        var match_id = match.match.id;
        var station_id = '';
        var get_method = 'POST';


        if(match.match.station_id) {
          station_id = match.match.station_id;
          get_method = 'PUT';

          if(!station) {
            get_method = 'DELETE';
          }
        }

        $http.post("postMatchStation/", {
          data: {
            "api_key" : $scope.credentials.organizer.api_key,
            "subdomain" : $scope.credentials.organizer.subdomain,
            "tournament_url" : $scope.activeTournament.tournament.url,
            "match_id": match_id,
            "match_station": station,
            "station_id": station_id,
            "get_method": get_method
          }
        })
        .then(
        function(response){
          $scope.getMatchStation(match);
        }, 
        function(response){
          alert('Error, sorry. Working on it');
        });

      }
    };

    $scope.determineRound = function(round) {
      var place;
      if(round > 0) {
        place = 'WR ';
      }
      else {
        place = 'LR ';
      }
      round = Math.abs(round);
      return place + round;
    };

    // init
    $scope.getCredentials(false, 'organizer');
    $scope.getCredentials(false, 'participant');
    


  });
}());