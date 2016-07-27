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
      'api_key': '',
      'subdomain': '',
      'hide_completed': localStorageService.get('hide_completed'),
      'hide_stations': localStorageService.get('hide_stations'),
      'tournament_filter': $scope.tournamentFilters[0]
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

    // $scope.setStation = function(match_id, station) {
    //   localStorageService.set(match_id, station);
    // };

    // $scope.getStation = function(match_id) {
    //   return localStorageService.get(match_id);
    // };

    $scope.hideCompletedMatches = function() {
      localStorageService.set('hide_completed', $scope.credentials.hide_completed);
    };
    $scope.hideStations = function() {
      localStorageService.set('hide_stations', $scope.credentials.hide_stations);
    };

    $scope.getActiveTournaments = function(filter) {
      $scope.is_loading = true;

      var state;
      if ($scope.credentials.tournament_filter && 'value' in $scope.credentials.tournament_filter) {
        state = $scope.credentials.tournament_filter.value;
      }
      else {
        state = 'in_progress';
      }

      $http.get("getTournaments/", {
        params: {
          "api_key" : $scope.credentials.api_key,
          "subdomain" : $scope.credentials.subdomain,
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
      $scope.tournamentAttachments();
      $scope.getTournamentParticipants();
    };

    $scope.tournamentAttachments = function() {
      $http.get("tournamentAttachments/", {
        params: {
          "api_key" : $scope.credentials.api_key,
          "subdomain" : $scope.credentials.subdomain,
          "tournament_url" : $scope.activeTournament.tournament.url
        }
      });
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

          if (value.match.attachment_count) {
           $scope.getMatchStation(value);

            // value.match.station = station_data[0];
            // value.match.station_id = station_data[1];
            // $scope.getMatchStation(value);
          }
          else {
            // value.match.station = '';
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

      var match_station = $scope.currentMatch.match.station || '';

      $http.post("postMatchResults/", {
        data: {
          "api_key" : $scope.credentials.api_key,
          "subdomain" : $scope.credentials.subdomain,
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
         $scope.getTournamentMatches();
         $('#matchModal').modal('hide');
       }, 
       function(response){
        console.log(response);
       });
    };

    $scope.getMatchStation = function(match) {

      $http.get("getMatchStation/", {
        params: {
          "api_key" : $scope.credentials.api_key,
          "subdomain" : $scope.credentials.subdomain,
          "tournament_url" : $scope.activeTournament.tournament.url,
          "match_id": match.match.id
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
          "api_key" : $scope.credentials.api_key,
          "subdomain" : $scope.credentials.subdomain,
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