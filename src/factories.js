(function () {
	'use strict';

	var app = angular.module('app');
	app.factory('getData', function($http) {
		return {
			imgs: function(coords) {
				return $http({

					method: "JSONP",
					params: {
						"tag": "me",
						"api_key": "AdIS9IZiSyLfN4dX66ThDoyELdQfB8RLqbj9RhewPzofv0xy6v",
						"callback": "JSON_CALLBACK"
					},
					url: 'https://api.tumblr.com/v2/tagged'
				});
			}
		}
	});

	

}());