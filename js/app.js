angular.module('challongeTO', ['ngRoute'])
.config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {
    $routeProvider.when('/about', {
        templateUrl: 'views/about.html'
    }).
    when('/contact', {
        templateUrl: 'views/contact.html'
    }).
    when('/tournaments/', {
        templateUrl: 'views/tournament_list.html',
        controller: 'tournamentListCtrl'
    }).
    when('/tournaments/:tournament_url', {
        templateUrl: 'views/tournament.html',
        controller: 'tournamentCtrl'
    }).
    when('/', {
        templateUrl: 'views/main.html',
        controller: 'mainCtrl'
    }).
    otherwise({
        redirectTo: '/'
    });

}])
.controller('tournamentListCtrl', function($scope, $http) {
    $scope.data = {};

    $scope.participants = {};

    $scope.username = "novacourtois";
    $scope.api_key = "N8D0OHugyqVgh0CVvni2A1V0jM7cYYXjchZF7107";
    $scope.activeTournament = {};
    $scope.tournament_list = {};

    $scope.chooseActiveTournament = function(tournament) {
        $scope.activeTournament = tournament;
    };

    $scope.showTournament = function(tournament) {
        $scope.activeTournament = tournament;
    };

    $scope.getActiveTournaments = function() {
        $http.get("https://api.challonge.com/v1/tournaments.json", {
            params: {
                "api_key" : "N8D0OHugyqVgh0CVvni2A1V0jM7cYYXjchZF7107",
                "state" : "in_progress"
            }
        })
        .success(function (data, status) {
            $scope.tournament_list = data;
            console.log($scope.tournament_list);
        })
        .error(function (data, status) {
           console.log(data);
        });
    };    

    $scope.getTournamentParticipants = function() {
        // https://api.challonge.com/v1/tournaments/{tournament}/participants.{json|xml}

        //https://api.challonge.com/v1/tournaments/1911138/participants.json?api_key=N8D0OHugyqVgh0CVvni2A1V0jM7cYYXjchZF7107
        
        $http.get("https://api.challonge.com/v1/tournaments/" + $scope.activeTournament.id + "participants.json", {
            params: {
                "api_key" : "N8D0OHugyqVgh0CVvni2A1V0jM7cYYXjchZF7107"
            }
        })
        .success(function (data, status) {
            console.log(data);

        })
        .error(function (data, status) {
           console.log(data);
        });
    };    

    $scope.postMatchResult = function(match) {
        $http.post("", {
            params: {
                "api_key" : $scope.api_key,
                "tournament" : $scope.activeTournament,
                "match": match
            }
        })
        .success(function (data, status) {

        })
        .error(function (data, status){
           
        });
    };

    $scope.getActiveTournaments();
})
.controller('tournamentCtrl', function($scope, $http, $routeParams) {
    $scope.data = {};

    $scope.participants = {};
    $scope.matches = [];

    $scope.username = "novacourtois";
    $scope.api_key = "N8D0OHugyqVgh0CVvni2A1V0jM7cYYXjchZF7107";

    $scope.activeTournament = {};

    $scope.activeTournament.tournament_url = $routeParams.tournament_url;

    $scope.getTournamentParticipants = function() {
        // https://api.challonge.com/v1/tournaments/{tournament}/participants.{json|xml}

        //https://api.challonge.com/v1/tournaments/1911138/participants.json?api_key=N8D0OHugyqVgh0CVvni2A1V0jM7cYYXjchZF7107

        $http.get("https://api.challonge.com/v1/tournaments/" + $scope.activeTournament.tournament_url + "/participants.json", {
            params: {
                "api_key" : "N8D0OHugyqVgh0CVvni2A1V0jM7cYYXjchZF7107"
            }
        })
        .success(function (data, status) {
            angular.forEach(data, function(value, key) {
                
                $scope.participants[value.participant.id] = {
                    "name" : value.participant.name,
                    "seed" : value.participant.seed
                };

            });
        })
        .error(function (data, status) {
           console.log(data);
        });
    };  

    $scope.getTournamentMatches = function() {
        // https://api.challonge.com/v1/tournaments/{tournament}/matches.{json|xml}

        
        $http.get("https://api.challonge.com/v1/tournaments/" + $scope.activeTournament.tournament_url + "/matches.json", {
            params: {
                "api_key" : "N8D0OHugyqVgh0CVvni2A1V0jM7cYYXjchZF7107"
            }
        })
        .success(function (data, status) {
            $scope.matches = data;
            console.log($scope.matches);
            // angular.forEach(data, function(value, key) {
                
            //     $scope.participants[value.participant.id] = {
            //         "name" : value.participant.name,
            //         "seed" : value.participant.seed
            //     };

            // });
            console.log(data);
        })
        .error(function (data, status) {
           console.log(data);
        });
    };    




    $scope.postMatchResult = function(match) {
        $http.post("", {
            params: {
                "api_key" : $scope.api_key,
                "tournament" : $scope.activeTournament,
                "match": match
            }
        })
        .success(function (data, status) {
            

        })
        .error(function (data, status){
           
        });
    };

    $scope.getTournamentParticipants();
    $scope.getTournamentMatches();

})
.controller('mainCtrl', function($scope, $http) {
    $scope.data = {};

    $scope.participants = {};

    $scope.username = "novacourtois";
    $scope.api_key = "N8D0OHugyqVgh0CVvni2A1V0jM7cYYXjchZF7107";
    $scope.activeTournament = {};
    $scope.tournaments = {};

    $scope.chooseActiveTournament = function(tournament) {
        $scope.activeTournament = tournament;
    };

    $scope.showTournament = function(tournament) {
        $scope.activeTournament = tournament;
    };

    $scope.getActiveTournaments = function() {
        $http.get("https://api.challonge.com/v1/tournaments.json", {
            params: {
                "api_key" : "N8D0OHugyqVgh0CVvni2A1V0jM7cYYXjchZF7107",
                "state" : "in_progress"
            }
        })
        .success(function (data, status) {
            $scope.tournaments = data;
            console.log($scope.tournaments);
        })
        .error(function (data, status) {
           console.log(data);
        });
    };    

    $scope.getTournamentParticipants = function() {
        // https://api.challonge.com/v1/tournaments/{tournament}/participants.{json|xml}

        //https://api.challonge.com/v1/tournaments/1911138/participants.json?api_key=N8D0OHugyqVgh0CVvni2A1V0jM7cYYXjchZF7107
        
        $http.get("https://api.challonge.com/v1/tournaments/" + $scope.activeTournament.id + "participants.json", {
            params: {
                "api_key" : "N8D0OHugyqVgh0CVvni2A1V0jM7cYYXjchZF7107"
            }
        })
        .success(function (data, status) {
            console.log(data);

        })
        .error(function (data, status) {
           console.log(data);
        });
    };    

    $scope.postMatchResult = function(match) {
        $http.post("", {
            params: {
                "api_key" : $scope.api_key,
                "tournament" : $scope.activeTournament,
                "match": match
            }
        })
        .success(function (data, status) {

        })
        .error(function (data, status){
           
        });
    };

    $scope.getActiveTournaments();
});
