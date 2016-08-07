(function () {
	'use strict';

	angular.module('app', ['ngAnimate', 'ngRoute', 'LocalStorageModule'])
		.config(function ($routeProvider, $locationProvider, $httpProvider) {
			$routeProvider
				.when('/', {
					templateUrl: 'views/landing.html'
				})
				.when('/about', {
					templateUrl: 'views/about.html'
				})
				.when('/contact', {
					templateUrl: 'views/contact.html'
				})
				.when('/app', {
					templateUrl: 'views/app.html',
					controller: 'appCtrl'
				})
				.otherwise({
					redirectTo: '/'
				});

			$locationProvider.html5Mode({
				enabled: true,
				requireBase: false
			});

			delete $httpProvider.defaults.headers.common['X-Requested-With'];
			$httpProvider.defaults.useXDomain = true;
			$httpProvider.defaults.headers.post['Accept'] = 'application/json, text/javascript';
			$httpProvider.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
			$httpProvider.defaults.headers.common['Accept'] = '*';
		})
		.config(function (localStorageServiceProvider) {
			localStorageServiceProvider
				.setPrefix('challonge');
		});

})();


