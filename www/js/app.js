angular.module('lunchadoresApp', [
  'ngCookies',
  'ionic',
  'controllers',
  'services'
])

  .config(ApplicationConfig)
  .factory('authInterceptor', AuthInterceptorFactory)
  .config(ApplicationRoutesConfig)
  .run(IonicRunConfig)
  .run(ApplicationRun)
;

function ApplicationConfig($urlRouterProvider, $httpProvider) {
  $urlRouterProvider.otherwise('/');
  $httpProvider.interceptors.push('authInterceptor');
}

function AuthInterceptorFactory($q, $cookieStore, $location) {
  return {
    request: request,
    responseError: responseError
  };

  // Add authorization token to headers
  function request(config) {
    config.headers = config.headers || {};
    if ($cookieStore.get('token')) {
      config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
    }
    return config;
  }

  // Intercept 401s and redirect you to login
  function responseError(response) {
    if (response.status === 401) {
      $location.path('/login');
      // remove any stale tokens
      $cookieStore.remove('token');
      return $q.reject(response);
    } else {
      return $q.reject(response);
    }
  }
}

function ApplicationRun($rootScope, $location) {
  // Redirect to login if route requires auth and you're not logged in
  $rootScope.$on('$stateChangeStart', function (event, next) {
    $rootScope.isLoggedInAsync(function (loggedIn) {
      if (loggedIn) {
        $rootScope.$broadcast('userLoginSuccess');
      }

      if (next.admin) {
        if (!$rootScope.isAdmin()) {
          $location.path('/');
        }
      } else if (next.authenticate && !loggedIn) {
        //$location.path('/login');
        console.log('redirect to login here')
      }
    });
  });
}

function ApplicationRoutesConfig($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    // setup an abstract state for the tabs directive
    .state('tab', {
      url: "/tab",
      abstract: true,
      templateUrl: "templates/tabs.html"
    })

    // Each tab has its own nav history stack:

    .state('tab.dash', {
      url: '/dash',
      views: {
        'tab-dash': {
          templateUrl: 'templates/tab-dash.html',
          controller: 'DashCtrl'
        }
      }
    })

    .state('tab.chats', {
      url: '/chats',
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-chats.html',
          controller: 'ChatsCtrl'
        }
      }
    })
    .state('tab.chat-detail', {
      url: '/chats/:chatId',
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })

    .state('tab.account', {
      url: '/account',
      views: {
        'tab-account': {
          templateUrl: 'templates/tab-account.html',
          controller: 'AccountCtrl'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/dash');
}

function IonicRunConfig($ionicPlatform) {
  $ionicPlatform.ready(function () {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
}
