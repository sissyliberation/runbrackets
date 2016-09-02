'use strict';

angular.module('runbracketsApp')
  .controller('SettingsCtrl', function ($scope, User, Auth) {
    $scope.errors = {};

    $scope.user = Auth.getCurrentUser();

    $scope.changePassword = function() {
      $scope.submitted = true;
      if($scope.passform.$valid) {
        Auth.changePassword( $scope.user.oldPassword, $scope.user.newPassword )
        .then( function() {
          $scope.passmessage = 'Password successfully changed.';
        })
        .catch( function() {
          $scope.passform.oldPassword.$setValidity('mongoose', false);
          $scope.errors.other = 'Incorrect password';
          $scope.message = '';
        });
      }
    };


    $scope.changeInfo = function() {
      $scope.submitted = true;
      if($scope.infoform.$valid) {
        Auth.changeInfo( $scope.user.pass, $scope.user.api_key, $scope.user.subdomain )
        .then( function() {
          $scope.infomessage = 'Info Updated';
        })
        .catch( function() {
          $scope.infoform.api_key.$setValidity('mongoose', false);
          $scope.errors.other = 'Try again?';
          $scope.message = '';
        });
      }
    };
  });
