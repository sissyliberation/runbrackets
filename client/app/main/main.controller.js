// 'use strict';

angular.module('runbracketsApp')
  .controller('MainCtrl', function ($scope, $http, Auth, $state) {

    $scope.is_loading = true;

    if(Auth.isLoggedIn()) {

      $scope.currentUser = Auth.getCurrentUser();

      $scope.use = {
        subdomain: false
      }

      if($scope.currentUser.subdomain) {
        $scope.use.subdomain = true;
      }

      $scope.tournaments = [];

      $scope.getTournaments = function() {
        $scope.is_loading = true;

        var state = 'pending';

        var params = {};
        params["api_key"] = $scope.currentUser.api_key;
        params["state"] = $scope.tournamentFilter;

        if( $scope.use.subdomain && $scope.currentUser.subdomain) {
          params["subdomain"] = $scope.currentUser.subdomain;
        }

        $http.get("/api/tournaments", {
          params: params
        })
        .then(
          function(data, status) {
            $scope.tournaments = data.data;
            angular.forEach($scope.tournaments, function(tournament) {
              if(tournament.tournament.subdomain) {
                tournament.tournament.temp_subdomain = tournament.tournament.subdomain;
                tournament.tournament.temp_url = tournament.tournament.url;
              }
              else {
                tournament.tournament.temp_subdomain = tournament.tournament.url;
              }
            });
            $scope.is_loading = false;
          }, 
          function(data, status) {
            console.log(data);
        });
      }; 

      $scope.getTournaments();

    }
    else {

      $scope.parse_url = function(url) {

        var participant_url = url;
        console.log(participant_url);

        var n = participant_url.search("://");
        if (n) {
          participant_url = participant_url.substring(n+3);
        }

        var split_slash = participant_url.split('/');
        var tournament_url = split_slash[split_slash.length - 1];

        var split_dot = participant_url.split('.');
        var subdomain;

        if (split_dot.length >2) {
          subdomain = split_dot[0];
        }
        else {
          subdomain = '';
        }

        var temp_subdomain;
        var temp_url;

        if(subdomain) {
          temp_subdomain = subdomain;
          temp_url = tournament_url;
        }
        else {
          temp_subdomain = tournament_url;
        }

        $state.go('bracket', { subdomain: temp_subdomain, url: temp_url });

      };


      $scope.is_loading = false;
    }


  });
