(function () {
  'use strict';

  var app = angular.module('app');
  app.controller('appCtrl', function($scope, $http, localStorageService) {

    $scope.activeTournament = '';
    $scope.matches = '';
    $scope.match_ids = {};
    $scope.currentMatch = {};

    $scope.participants = {};
    $scope.stations = {};

    $scope.is_loading = true;
    $scope.ready = false;

    $scope.credentials = {
      'api_key': '',
      'subdomain': '',
      'hide_completed': localStorageService.get('hide_completed'),
      'hide_stations': localStorageService.get('hide_stations')
    };

    $scope.getCredentials = function(clicked) {
      $scope.credentials.api_key = localStorageService.get('api_key');
      $scope.credentials.subdomain = localStorageService.get('subdomain');

      if (!$scope.credentials.api_key) {
        $scope.ready = false;
      }
      else {
        $scope.ready = true;
        $scope.confirmed = clicked;
      }
    };

    $scope.setCredentials = function() {
      localStorageService.set('api_key',   $scope.credentials.api_key);
      localStorageService.set('subdomain', $scope.credentials.subdomain);
      $scope.getCredentials(true);
    };

    $scope.setStation = function(match_id, station) {
      localStorageService.set(match_id, station);
    };

    $scope.getStation = function(match_id) {
      return localStorageService.get(match_id);
    };

    $scope.hideCompletedMatches = function() {
      localStorageService.set('hide_completed', $scope.credentials.hide_completed);
    };
    $scope.hideStations = function() {
      localStorageService.set('hide_stations', $scope.credentials.hide_stations);
    };

    $scope.getActiveTournaments = function() {
      $scope.is_loading = true;

      $http.get("getTournaments/", {
        params: {
          "api_key" : $scope.credentials.api_key,
          "subdomain" : $scope.credentials.subdomain
        }
      })
      .success(function (data, status) {
        $scope.tournaments = data;
        console.log($scope.tournaments);
        $scope.is_loading = false;
      })
      .error(function (data, status) {
        console.log(data);
      });
    }; 

    $scope.selectTournament = function(tournament) {
      $scope.activeTournament = tournament;
      $scope.getTournamentParticipants();
    };

    $scope.getTournamentParticipants = function() {
      $scope.is_loading = true;
      $http.get("getTournamentParticipants/", {
        params: {
          "api_key" : $scope.credentials.api_key,
          "subdomain" : $scope.credentials.subdomain,
          "tournament_url" : $scope.activeTournament.tournament.url
        }
      })
      .success(function (data, status) {
        var participants = data;

        for(var i = 0; i < participants.length; i++) {
          $scope.participants[participants[i].participant.id] = participants[i].participant.name;
        }

        $scope.getTournamentMatches();
      })
      .error(function (data, status) {
       console.log(data);
      });
    };

    $scope.getTournamentMatches = function() {
      $scope.is_loading = true;

      $http.get("getMatches/", {
        params: {
          "api_key" : $scope.credentials.api_key,
          "subdomain" : $scope.credentials.subdomain,
          "tournament_url" : $scope.activeTournament.tournament.url
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
          value.match.station = $scope.getStation(value.match.id);
        });

        $scope.is_loading = false;
      })
      .error(function (data, status) {
       console.log(data);
      });
    };

    $scope.editMatch = function(match) {
      // there really isn't anything you can do on a match that is pending, at least now
      console.log(match.match.state);
      if(match.match.state != 'pending') {
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

      $http.post("postMatchResults/", {
        data: {
          "api_key" : $scope.credentials.api_key,
          "subdomain" : $scope.credentials.subdomain,
          "tournament_url" : $scope.activeTournament.tournament.url,
          "match_id": $scope.currentMatch.match.id,
          "score": score,
          'winner_id': $scope.currentMatch.match.winner_id
        }
      })
      .then(
       function(response){
         $scope.setStation($scope.currentMatch.match.id, '');
         $scope.getTournamentMatches();
         $('#matchModal').modal('hide');
       }, 
       function(response){
        alert('Error, sorry. Working on it');
       });
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
    $scope.getCredentials(false);
    $scope.getActiveTournaments();

  });
}());