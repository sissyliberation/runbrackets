'use strict';

angular.module('runbracketsApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('bracket', {
        url: '/bracket/:subdomain/:url',
        templateUrl: 'app/bracket/bracket.html',
        controller: 'BracketCtrl'
      });
  });