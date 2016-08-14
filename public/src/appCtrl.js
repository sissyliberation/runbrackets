(function () {
	'use strict';

	var app = angular.module('app');
	app.controller('appCtrl', function ($scope, $http, $state, localStorageService, $interval) {
		$scope.Math = window.Math;

		$scope.matches = '';
		$scope.match_ids = {};
		$scope.currentMatch = {};

		$scope.participants = {};
		$scope.stations = {};

		$scope.is_loading = false;

		$scope.tournamentFilters = [{
			"name"	: "All",
			"value"	: "all"
		}, {
			"name"	: "In Progress",
			"value"	: "in_progress"
		}, {
			"name"	: "Completed",
			"value"	: "ended"
		}, {
			"name"	: "Pending",
			"value"	: "ended"
		}];

		$scope.fields = {
			'organizer'	: {
				'api_key'	: null,
				'subdomain'	: null
			},
			'participant'	: {
				'full_url'	: null
			}
		};

		$scope.session_data = {
			'settings' : {
				'tournament_filter'	: $scope.tournamentFilters[0],
				'hide_completed'	: null,
				'hide_stations'		: null,
				'hide_unavailable'	: null
			}
		};

		$scope.active_tournament = {
			'tournament'	: false, // Challonge API response.
			'domain'		: null,
			'is_organizer'	: false,
			'api_params' : {
				'api_key'			: null,
				'subdomain'			: null,
				'tournament_url'	: null
			}
		};

		function getStateParams() {
			$.extend(true, $scope.active_tournament,
				{
					'domain'			: 'challonge',
					'api_params' : {
						'subdomain'			: $state.params.subdomain,
						'tournament_url'	: $state.params.eventId
					}
				});
		}

		function getLocalStorageServiceData() {
			$.extend(true, $scope.fields, 		localStorageService.get('scope.fields'));
			$.extend(true, $scope.session_data, localStorageService.get('scope.session_data'));
		}

		function setLocalStateStorageServiceData() {
			localStorageService.set('scope.fields', 		$scope.fields);
			localStorageService.set('scope.session_data', 	$scope.session_data);
		}

		// Validate the request for Participant viewing.
		$scope.validateParticipantCriteria = function() {
			setLocalStateStorageServiceData(); // Persist the user's entered fields.

			try {
				var a = $('<a>', { href:$scope.fields.participant.full_url } )[0];
				var domain = a.hostname; // Includes the subdomain, will require a parse otherwise.
				$scope.active_tournament.api_params.tournament_url	= a.pathname.replace('/', '');

				var hostname_split = domain.split(".");
				$scope.active_tournament.api_params.subdomain = hostname_split.length > 2 ? hostname_split[0] : null;
			} catch (e) {
				console.log('setCredentials: Bad URL:', $scope.fields.participant.full_url, a);
			}

			$scope.active_tournament.is_organizer = false;
			$scope.gotoTournament($scope.active_tournament.api_params.subdomain, $scope.active_tournament.api_params.tournament_url);
		};

		// View the tournaments available to the chosen Organizer.
		$scope.showAvailableTournaments = function() {
			$scope.active_tournament.is_organizer = true;

			setLocalStateStorageServiceData(); // Persist the user's entered fields.

			var state = 'in_progress';
			if ($scope.fields.organizer.tournament_filter && 'value' in $scope.fields.organizer.tournament_filter) {
				state = $scope.fields.organizer.tournament_filter.value;
			}

			$scope.is_loading = true;
			$http.get('/query/getTournaments/', {
					params: {
						"api_key"	: $scope.fields.organizer.api_key,
						"subdomain"	: $scope.fields.organizer.subdomain,
						"state"		: state
					}
				})
				.then(
					function successCallback(response) {
						$scope.tournaments = response.data.data;
						$scope.is_loading = false;
						$scope.confirmed = true;
					},
					function errorCallback(response) {
						console.log(response);
					});
		};

		$scope.selectTournament = function (tournament) {
			$scope.active_tournament.tournament 				= tournament.tournament;
			$scope.active_tournament.api_params.subdomain 		= tournament.tournament.subdomain;
			$scope.active_tournament.api_params.tournament_url	= tournament.tournament.url;
			$scope.active_tournament.api_params.api_key			= $scope.fields.organizer.api_key;

			$scope.active_tournament.is_organizer 				= true;
			$scope.gotoTournament(tournament.tournament.subdomain, tournament.tournament.url);
		};

		$scope.activateTournament = function () {
			if (!$scope.active_tournament.is_organizer) {
				$scope.getTournament(); // Ensure the Participant page has access to the tournament details like name and progress.
				$interval(function () {
					$scope.getTournamentParticipants(false);
				}, 30000);
			}
			$scope.getTournamentParticipants(true);
			$scope.confirmed = true;
		};

		// What is this intended to do?
		$scope.tournamentAttachments = function () {
			$http.get("/query/tournamentAttachments/", {
				params: $scope.active_tournament.api_params
			});
		};

		$scope.getTournament = function() {
			$http.get("/query/getTournament/", {
					params: $scope.active_tournament.api_params
				})
				.then(
					function successCallback(response) {
						if (!response.data.errors) {
							$scope.active_tournament.tournament = response.data.tournament;
						}
					},
					function errorCallback(response) {
						console.log(response);
					}
				);
		};

		$scope.getTournamentParticipants = function (reload) {
			$scope.is_loading 	= reload;

			$http.get("/query/getTournamentParticipants/", {
					params: $scope.active_tournament.api_params
				})
				.then(
					function successCallback(response) {
						var participants = response.data;
						for (var i = 0; i < participants.length; i++) {
							$scope.participants[participants[i].participant.id] = participants[i].participant.name;
						}
						$scope.getTournamentMatches(reload);
					},
					function errorCallback(response) {
						console.log(response);
					}
				);
		};

		$scope.getTournamentMatches = function (reload) {
			$scope.is_loading 	= reload;

			$http.get("/query/getMatches/", {
					params: $scope.active_tournament.api_params
				})
				.then(
					function successCallback(response) {
						$scope.matches 		= response.data;
						$scope.match_ids 	= {};

						// store match ids to determine winner
						angular.forEach($scope.matches, function (value) {
							$scope.match_ids[value.match.id] = {
								'id'	: value.match.identifier,
								'round'	: value.match.round
							};

							if (value.match.attachment_count) {
								$scope.getMatchStation(value);
							}

							if (value.match.state == 'open' && (value.match.underway_at || value.match.scores_csv != "")) {
								value.match.state = 'in-progress';
							}

							value.match.order = $scope.matchOrder(value);
						});
						$scope.is_loading = false;
					},
					function errorCallback(response) {
						console.log(response);
					}
				);
		};

		$scope.editMatch = function (match) {
			// there really isn't anything you can do on a match that is pending, at least now
			if ($scope.active_tournament.is_organizer && match.match.state != 'pending') {
				$scope.currentMatch = match;
				if ($scope.currentMatch.match.scores_csv) {
					var scores = $scope.currentMatch.match.scores_csv.split('-');
					$scope.currentMatch.match.player1_score = parseInt(scores[0]) || 0;
					$scope.currentMatch.match.player2_score = parseInt(scores[1]) || 0;
				}
				$('#matchModal').modal();
			}
		};

		$scope.postMatchResults = function () {
			var p1_score = $scope.currentMatch.match.player1_score || 0;
			var p2_score = $scope.currentMatch.match.player2_score || 0;
			var score = '' + p1_score + '-' + p2_score;

			var match_station = $scope.currentMatch.match.station || '';

			$http.post("/query/postMatchResults/", {
					data: $.extend(true, $scope.active_tournament.api_params, {
						"match_id"		: $scope.currentMatch.match.id,
						"match_station"	: match_station,
						"score"			: score,
						'winner_id'		: $scope.currentMatch.match.winner_id
					})
				})
				.then(
					function successCallback(response) {
						$scope.getTournamentMatches(false);
						$('#matchModal').modal('hide');
					},
					function errorCallback(response) {
						console.log(response);
					}
				);
		};

		$scope.getMatchStation = function (match) {
			$http.get("/query/getMatchStation/", {
					params: $.extend(true, $scope.active_tournament.api_params, {
						'match_id'		: match.match.id
					})
				})
				.then(
					function successCallback(response) {

						if (!response.data.match) {
							return;
						}

						var match_data = response.data.match;

						var station = '';
						var id = '';

						for (var i = 0; i < match_data.attachment_count; ++i) {
							if (match_data.attachments[i].match_attachment.description.substring(0, 8) == 'station ') {
								match.match.station = match_data.attachments[i].match_attachment.description.substring(8);
								match.match.station_id = match_data.attachments[i].match_attachment.id;
							}
						}
					},
					function errorCallback(response) {
						console.log(response);
					});
		};

		$scope.updateMatchStation = function (match, station) {
			if ($scope.active_tournament.is_organizer) {
				var match_id 	= match.match.id;
				var station_id 	= '';
				var get_method 	= 'POST';


				if (match.match.station_id) {
					station_id 	= match.match.station_id;
					get_method 	= 'PUT';

					if (!station) {
						get_method = 'DELETE';
					}
				}

				$http.post("/query/postMatchStation/", {
						data: $.extend(true, $scope.active_tournament.api_params, {
							"match_id"		: match_id,
							"match_station"	: station,
							"station_id"	: station_id,
							"get_method"	: get_method
						})
					})
					.then(
						function successCallback(response) {
							$scope.getMatchStation(match);
						},
						function errorCallback(response) {
							console.log(response);
							alert('Error, sorry. Working on it');
						});

			}
		};

		// Verify that the $scope'd api_key will work for the currently active tournament.
		// Fails fast if the api_key is not defined.
		$scope.validateApiKey = function (api_key) {
			if (api_key) {
				$http.get('/query/validateApiKey/', {
						params: $.extend({}, $scope.active_tournament.api_params, {
							"api_key": api_key
						})
					})
					.then(
						function successCallback(response) {
							$scope.active_tournament.is_organizer = true;
							$scope.active_tournament.api_params.api_key = api_key;
							console.log(response.status, 'api_key is valid : user is the organizer');
						},
						function errorCallback(response) {
							console.log(response.status, 'api_key is invalid : user is NOT the organizer');
						}
					);
			}
		};
		
		$scope.gotoTournament = function(subdomain, tournament_url) {
			$state.go('app.view', {
				'subdomain' : subdomain,
				'eventId' 	: tournament_url })
				.then($scope.activateTournament);
		};


		$scope.determineRound = function (round) {
			var place;
			if (round > 0) {
				place = 'WR ';
			}
			else {
				place = 'LR ';
			}
			round = Math.abs(round);
			return place + round;
		};

		// Determine match order by state.
		// 0: green / success / complete
		// 1: purple / info / in progress, started
		// 2: grey / pending / available, not started
		// 3: white / none / unavailable (one or more participants undetermined)
		$scope.matchOrder = function(match) {
			if (match.match.state == 'complete')
				return 0;
			if (match.match.state == 'in-progress')
				return 1;
			if (match.match.state == 'open') {
				return 2;
			}
			return 3;
		};

		$scope.updateStoredSession = function() {
			setLocalStateStorageServiceData();
		};

		function tryActivateTournament() {
			$scope.validateApiKey($scope.fields.organizer.api_key);
			$scope.activateTournament();
		}

		$scope.$watch('session_data', function() {
			$scope.updateStoredSession();
		});


		getLocalStorageServiceData();
		getStateParams(); // Ensure the newest requested tournament is being loaded.

		if ($state.is('app.view')) {
			tryActivateTournament();
		}
	});
}());