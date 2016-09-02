'use strict';

angular.module('runbracketsApp')
  .controller('BracketCtrl', function ($scope, $stateParams, localStorageService, Auth, $http, $mdDialog, $interval) {
   	$scope.tournament_url = $stateParams.subdomain;

   	if($stateParams.url) {
   		$scope.tournament_url = $stateParams.url;
   		$scope.subdomain = $stateParams.subdomain;
   	}

    $scope.Math = window.Math;

   	$scope.currentTournament = '';
   	$scope.matches = [];
   	$scope.match_ids = {};
   	$scope.current_match = {};
   	$scope.participants = {};
   	$scope.stations = [];
   	$scope.new_station_name = '';	
   	$scope.hide_completed = localStorageService.get('hide_completed') || false;
   	$scope.hide_stations = localStorageService.get('hide_stations') || false;

   	$scope.is_loading = true;
    $scope.own_tournament = false;

    $scope.read_access = "You only have read access to this tournament";

   	$scope.hideCompletedMatches = function(val) {
      localStorageService.set('hide_completed', val);
    };
    $scope.hideStations = function(val) {
      localStorageService.set('hide_stations', val);
    };

    $scope.addStation = function(val) {
      $scope.new_station_name = val;
      $scope.stations.push({'name': $scope.new_station_name});
      localStorageService.set('station-' + $scope.new_station_name, $scope.new_station_name);
      $scope.new_station_name = '';
    };

    $scope.deleteStation = function(station_name) {

      localStorageService.remove('station-' + station_name);
      var station_index;

      for(var i = 0; i < $scope.stations.length; ++i) {
        if ($scope.stations[i].name == station_name) {
          station_index = i;
        }
      }

      if (station_index) {
        $scope.stations.splice(station_index, 1);
      }
    };

    $scope.activateTournamentAttachments = function() {

      var params = {};
      params["tournament_url"] = $scope.tournament_url;
      
      if($scope.subdomain) {
        params["subdomain"] = $scope.subdomain;
      }

      // being logged in != viewing one of your tournaments
      // turning on attachments will determine this
      // it's also necessary for managing stations so it works out

      if(Auth.isLoggedIn()) {
        params["api_key"] = Auth.getCurrentUser().api_key;
      }

      $http.get("/api/tournaments/attachments/", {
        params: params
      })
      .then(
        function(data) {

          if('errors' in data.data && data.data.errors.length) {
            if (data.data.errors[0] == $scope.read_access) {
              // $scope.own_tournament = true;
            }
            else {
              // display error

            }
          }
          else {
            $scope.own_tournament = true;
            if(!Auth.isLoggedIn()) {
             $scope.own_tournament = false;
            }
          }
          if($scope.own_tournament) {
            $scope.currentTournament = data.data;
            $scope.getTournamentParticipants();
          }
          else {
            $scope.getTournamentDetails();
            $scope.getTournamentParticipants();
            $interval(function () {
              $scope.getTournamentDetails();
              $scope.getTournamentParticipants();
            }, 30000);
          }
        },
        function(data) {
          console.log(data);
      });
    };

    $scope.getTournamentDetails = function() {

      var params = {};

      params["tournament_url"] = $scope.tournament_url;
      
      if($scope.subdomain) {
        params["subdomain"] = $scope.subdomain;
      }

      $http.get("/api/tournaments/one/", {
        params: params
      })
      .then(
        function(data) {
          $scope.currentTournament = data.data;
        }, 
        function(data) {
          console.log(data);
      });

    };

    $scope.getTournamentParticipants = function(reload) {
      $scope.is_loading = true;

      var params = {};
      params["tournament_url"] = $scope.tournament_url;
      
      if($scope.subdomain) {
        params["subdomain"] = $scope.subdomain;
      }

      if($scope.own_tournament) {
        params["api_key"] = Auth.getCurrentUser().api_key;
      }

      $http.get("/api/tournaments/participants/", {
        params: params
      })
      .then(
        function(data) {
          var participants = data.data;

          for(var i = 0; i < participants.length; i++) {
            $scope.participants[participants[i].participant.id] = participants[i].participant.display_name || participants[i].participant.username || participants[i].participant.name;
          }

          $scope.getTournamentMatches(true);
        }, 
        function(data) {
          console.log(data);
      });
    };

    $scope.getTournamentMatches = function(reload) {
      $scope.is_loading = true;
      

      var params = {};
      params["tournament_url"] = $scope.tournament_url;
      
      if($scope.subdomain) {
        params["subdomain"] = $scope.subdomain;
      }

      if($scope.own_tournament) {
        params["api_key"] = Auth.getCurrentUser().api_key;
      }

      $http.get("/api/tournaments/matches/", {
        params: params
      })
      .then(
        function(data, status) {
          $scope.matches = data.data;
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

            // sort matches
            value.match.order = $scope.matchOrder(value);
          });

          $scope.is_loading = false;
          
        }, 
        function(data, status) {
          console.log(data);
      });
    };

    $scope.editMatch = function(match) {
      // there really isn't anything you can do on a match that is pending, at least now
      if($scope.own_tournament && match.match.state != 'pending') {
        $scope.currentMatch = match;
        if($scope.currentMatch.match.scores_csv) {
          var scores = $scope.currentMatch.match.scores_csv.split('-');
          $scope.currentMatch.match.player1_score = parseInt(scores[0]) || 0;
          $scope.currentMatch.match.player2_score = parseInt(scores[1]) || 0;
        }
        // $('#matchModal').modal();

        $scope.showPrerenderedDialog();
      }
    };

    $scope.postMatchResults = function() {
      var p1_score = $scope.currentMatch.match.player1_score || 0;
      var p2_score = $scope.currentMatch.match.player2_score || 0;
      var score = '' + p1_score + '-' + p2_score;

      var match_station = $scope.currentMatch.match.station || '';
      var station_id;

      if($scope.currentMatch.match.winner_id) {

        angular.forEach($scope.stations, function(station) {
          if (station.name == $scope.currentMatch.match.station) {
            $scope.updateMatchStation($scope.currentMatch, '', true);
            station_id = station.id;
            delete station.id;
            delete station.match;
          }
        });
      }

      var data = {};

      if($scope.subdomain) {
        data["subdomain"] = $scope.subdomain;
      }

      data["api_key"] = Auth.getCurrentUser().api_key;
      data["tournament_url"] = $scope.tournament_url;
      data["match_id"] = $scope.currentMatch.match.id;
      data["station_id"] = station_id;
      data["match_station"] = match_station;
      data["score"] = score;
      data["winner_id"] = $scope.currentMatch.match.winner_id;

      $http.post("/api/tournaments/postMatchResults/", {
        data: data
      })
      .then(
        function(response) {

          $scope.getStoredStations();
          $scope.getTournamentDetails();
          $scope.getTournamentMatches(true);

          // $('#matchModal').modal('hide');

          $mdDialog.hide();

        }, 
        function(response) {
          console.log(response);
      });
    };

    $scope.getMatchStation = function(match) {

      var params = {};
      params["tournament_url"] = $scope.tournament_url;
      
      if($scope.subdomain) {
        params["subdomain"] = $scope.subdomain;
      }

      if($scope.own_tournament) {
        params["api_key"] = Auth.getCurrentUser().api_key;
      }

      params["match_id"] = match.match.id;

      $http.get("/api/tournaments/station/", {
        params: params
      })
      .then(
        function(data) {
          if (!data.data.match) {
            return;
          }

          var match_data = data.data.match;
          var station = '';
          var id = '';

          for(var i = 0; i < match_data.attachment_count; ++i) {
            if(match_data.attachments[i].match_attachment.description.substring(0,8) == 'station-') {

              match.match.station = match_data.attachments[i].match_attachment.description.substring(8);
              match.match.station_id = match_data.attachments[i].match_attachment.id;

              var station_added = false;

              angular.forEach($scope.stations, function(station) {
                if (station.name == match.match.station) {
                  station.id = match.match.station_id;
                  station.match = match.match.id;
                  station_added = true;
                }
              });

              // delete match attachment if for some reason it's not on the station manager
              if (!station_added) {
                $scope.updateMatchStation(match, '', true);
              }

            }
          }
        }, 
        function(response) {
          console.log(response);
      });
    };

    $scope.updateMatchStation = function(match, station, finished) {

      if ($scope.own_tournament) {

        var match_id = match.match.id;
        var station_id = '';
        var get_method = 'POST';

        if(match.match.station_id) {
          station_id = match.match.station_id;
          get_method = 'PUT';
        }
        
        if(get_method == 'PUT') {
            angular.forEach($scope.stations, function(s) {
            if (s.id == match.match.station_id) {
              delete s.id;
              delete s.match;
            }
            if (s.name == match.match.station) {

              s.id = match.match.station_id;
              s.match = match.match.id;
            }
          });
        }

        if(finished) {

          angular.forEach($scope.stations, function(s) {
            if (s.name == match.match.station) {
              delete s.id;
              delete s.match;
            }
          });

          get_method = 'DELETE';
        }

        var data = {};

        if($scope.subdomain) {
          data["subdomain"] = $scope.subdomain;
        }

        data["api_key"] = Auth.getCurrentUser().api_key;
        data["tournament_url"] = $scope.tournament_url;
        data["match_id"] = match.match.id;
        data["get_method"] = get_method;
        data["station_id"] = station_id;
        data["match_station"] = station;

        $http.post("/api/tournaments/postMatchStation/", {
          data: data
        })
        .then(
          function(data) {

            if(get_method == 'POST') {
              $scope.getMatchStation(match);
            }
          }, 
          function(response) {
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

    // determine match order by state
    // 0: green  / success
    // 1: purple / info
    // 2: grey   / pending
    // 3: white  / none
    // 4: red    / error (not yet implemented)
    $scope.matchOrder = function(match) {
      if (match.match.state == 'complete') {
        return 0;

      }
      else if (match.match.state == 'open') {
        if (match.match.underway_at || match.match.scores_csv) {
          return 1;
        }
        else {
          return 2;
        }
      }
      else {
        return 3;
      }
    };

    // get saved stations
    $scope.getStoredStations = function(flag) {
      var lsKeys = localStorageService.keys();
      $scope.stations = [];

      for(var i = 0; i < lsKeys.length; ++i) {
        if (lsKeys[i].substring(0,8) == 'station-') {
          $scope.stations.push({'name':lsKeys[i].substring(8)});
        }
      }

      if(flag) {
        $scope.activateTournamentAttachments();
      }
    };

    $scope.getStoredStations(true);


    // $interval(function () {
    //   $scope.getTournamentDetails();
    // }, 10000);

    $scope.showPrerenderedDialog = function(ev) {
    $mdDialog.show({
      contentElement: '#matchDialog',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true
    });
  };

      $scope.hide = function() {
        $mdDialog.hide();
      };
      $scope.cancel = function() {
        $mdDialog.cancel();
      };
      $scope.answer = function() {
        $mdDialog.hide();
      };


  });
