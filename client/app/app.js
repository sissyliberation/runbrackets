'use strict';

angular.module('runbracketsApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngAnimate',
  'ngMessages',
  'ui.router',
  'ngMaterial',
  'smart-table',
  'LocalStorageModule'
])
  .config(function($mdIconProvider, $mdThemingProvider) {
    $mdIconProvider
      .iconSet('action', '../assets/iconsets/action-icons.svg', 24)
      .iconSet('alert', '../assets/iconsets/alert-icons.svg', 24)
      .iconSet('av', '../assets/iconsets/av-icons.svg', 24)
      .iconSet('communication', '../assets/iconsets/communication-icons.svg', 24)
      .iconSet('content', '../assets/iconsets/content-icons.svg', 24)
      .iconSet('device', '../assets/iconsets/device-icons.svg', 24)
      .iconSet('editor', '../assets/iconsets/editor-icons.svg', 24)
      .iconSet('file', '../assets/iconsets/file-icons.svg', 24)
      .iconSet('hardware', '../assets/iconsets/hardware-icons.svg', 24)
      .iconSet('icons', '../assets/iconsets/icons-icons.svg', 24)
      .iconSet('image', '../assets/iconsets/image-icons.svg', 24)
      .iconSet('maps', '../assets/iconsets/maps-icons.svg', 24)
      .iconSet('navigation', '../assets/iconsets/navigation-icons.svg', 24)
      .iconSet('notification', '../assets/iconsets/notification-icons.svg', 24)
      .iconSet('social', '../assets/iconsets/social-icons.svg', 24)
      .iconSet('toggle', '../assets/iconsets/toggle-icons.svg', 24)
      .iconSet('avatar', '../assets/iconsets/avatar-icons.svg', 128);


      $mdThemingProvider.definePalette('app-accent', {
        '50': '#ffffff',
        '100': '#ffd4dc',
        '200': '#ff9caf',
        '300': '#ff5475',
        '400': '#ff365d',
        '500': '#ff1744',
        '600': '#f70030',
        '700': '#d9002a',
        '800': '#ba0024',
        '900': '#9c001e',
        'A100': '#ffffff',
        'A200': '#ffd4dc',
        'A400': '#ff365d',
        'A700': '#d9002a',
        'contrastDefaultColor': 'light',
        'contrastDarkColors': '50 100 200 300 A100 A200'
      });
      $mdThemingProvider.definePalette('app-primary', {
        '50': '#ffffff',
        '100': '#d5f1ff',
        '200': '#9ddfff',
        '300': '#56c9fe',
        '400': '#37bffe',
        '500': '#19b5fe',
        '600': '#01a9f7',
        '700': '#0194d9',
        '800': '#017fba',
        '900': '#016a9c',
        'A100': '#ffffff',
        'A200': '#d5f1ff',
        'A400': '#37bffe',
        'A700': '#0194d9',
        'contrastDefaultColor': 'light',
        'contrastDarkColors': '50 100 200 300 400 500 A100 A200 A400'
      });

    $mdThemingProvider.theme('light')
    .primaryPalette('app-primary')
    .accentPalette('app-accent');

    $mdThemingProvider.theme('night')
    .primaryPalette('app-primary')
    .accentPalette('app-accent').dark();

    $mdThemingProvider.alwaysWatchTheme(true);

  })
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, $urlMatcherFactoryProvider, $compileProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
    $urlMatcherFactoryProvider.strictMode(false);
    $compileProvider.debugInfoEnabled(false);
  })
  .config(function (localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('challonge');
  })

  .factory('authInterceptor', function ($rootScope, $q, $cookieStore, $location) {
    return {
      // Add authorization token to headers
      request: function (config) {
        config.headers = config.headers || {};
        if ($cookieStore.get('token')) {
          config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
        }
        return config;
      },

      // Intercept 401s and redirect you to login
      responseError: function(response) {
        if(response.status === 401) {
          $location.path('/login');
          // remove any stale tokens
          $cookieStore.remove('token');
          return $q.reject(response);
        }
        else {
          return $q.reject(response);
        }
      }
    };
  })
   

  .run(function ($rootScope, $location, Auth, localStorageService) {
    // Redirect to login if route requires auth and you're not logged in

    $rootScope.theme = localStorageService.get('theme') || 'night';

    $rootScope.changeTheme = function() {
      $rootScope.theme = $rootScope.theme === 'night' ? 'light' : 'night';
      localStorageService.set('theme', $rootScope.theme);
      // console.log($rootScope.theme);
    };

    $rootScope.$on('$stateChangeStart', function (event, next) {
      Auth.isLoggedInAsync(function(loggedIn) {
        $rootScope.logged_in = loggedIn;
        if (next.authenticate && !loggedIn) {
          event.preventDefault();
          $location.path('/login');
        }
      });
    });
  });
