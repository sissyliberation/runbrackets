'use strict';

angular.module('runbracketsApp')
  .controller('LoginCtrl', function ($scope, Auth, $location, $state) {
    $scope.user = {};
    $scope.errors = {};

    $scope.login = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.login({
          email: $scope.user.email,
          password: $scope.user.password
        })
        .then( function() {
          $state.go('main', { previousState : { name : $state.current.name } }, {} );
        })
        .catch( function(err) {
          $scope.errors.other = err.message;
        });
      }
    };

  });
