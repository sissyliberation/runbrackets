(function () {
	'use strict';

	angular.module('app', ['ngAnimate', 'ui.router', 'ngRoute', 'LocalStorageModule'])
		.config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
			$urlRouterProvider.otherwise('/');

			$stateProvider
				.state('home', {
					url			: '/',
					templateUrl	: 'views/landing.html'
				})
				.state('about', {
					url			: '/about',
					templateUrl	: 'views/about.html'
				})
				.state('contact', {
					url			: '/contact',
					templateUrl	: 'views/contact.html'
				})
				.state('app', {
					abstract	: true,
					url			: '/app',
					template	: '<div ui-view></div>',
					controller	: 'appCtrl'
				})
				.state('app.index', {
					url			: '',
					templateUrl	: 'views/app/index.html'
				})
				.state('app.view', {
					url			: '/:subdomain/:eventId',
					templateUrl	: '/views/app/index.html',
					params 		: {
						subdomain : { squash: true, value: null }
					}
				});

			$locationProvider.html5Mode({
				enabled		: true,
				requireBase	: false
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


