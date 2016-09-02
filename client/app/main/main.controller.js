// 'use strict';

angular.module('runbracketsApp')
  .controller('MainCtrl', function ($scope, $http, Auth) {

    $scope.is_loading = true;
    if($scope.logged_in) {

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
      $scope.is_loading = false;
    }


  });
