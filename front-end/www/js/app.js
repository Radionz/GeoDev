// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('Welcome', []);
angular.module('Game', []);
angular.module('Question', []);
angular.module('Chat', []);
angular.module('starter', ['ionic', 'starter.controllers', 'Welcome', 'Game', 'Question', 'Chat'])

.run(function($ionicPlatform, UserService, $rootScope, ServerEndpoint) {

    $rootScope.socket = io.connect(ServerEndpoint.url);

    if (typeof(Storage) !== "undefined" && localStorage.getItem("userId") !== null) {
      UserService.getUser(localStorage.getItem("userId")).then(function(response) {
        var user = response.data;
        delete user.password;
        $rootScope.loggedInUser = user;
      });
    };

    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
})

.constant('ServerEndpoint', {
    //url: 'http://192.168.1.19:8080'
    //url: 'http://localhost:8080'
    url: 'http://home.dobl.fr:8080'
})

.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider

    .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
    })
    .state('app.welcome', {
        url: '/welcome',
        views: {
            'menuContent': {
                templateUrl: 'modules/welcome/views/welcome.html',
                controller: 'WelcomeCtrl'
            }
        }
    })
    .state('app.signIn', {
        url : '/sign-in',
        views: {
            'menuContent' :{
                templateUrl: "modules/welcome/views/sign-in.html",
                controller: 'SignInCtrl'
            }
        }
    })
    .state('app.signUp', {
        url : '/sign-up',
        views: {
            'menuContent' :{
                templateUrl: "modules/welcome/views/sign-up.html",
                controller: 'SignUpCtrl'
            }
        }
    })
    .state('app.forgotPassword', {
        url : '/forgot-password',
        views: {
            'menuContent' :{
                templateUrl: "modules/welcome/views/forgot-password.html",
                controller: 'ForgotPasswordCtrl'
            }
        }
    })
    .state('app.game', {
        url: '/game/:id',
        views: {
            'menuContent': {
                templateUrl: 'modules/game/views/game.html',
                controller: 'GameCtrl'
            }
        }
    })
    .state('app.gameManager', {
        url: '/gameManager',
        views: {
            'menuContent': {
                templateUrl: 'modules/game/views/gameManager.html',
                controller: 'GameManagerCtrl'
            }
        }
    })
    .state('app.gameAdmin', {
        url: '/gameAdmin',
        views: {
            'menuContent': {
                templateUrl: 'modules/game/views/gameAdmin.html',
                controller: 'GameAdminCtrl'
            }
        }
    })
    .state('app.questionManager', {
        url: '/questionManager',
        views: {
            'menuContent': {
                templateUrl: 'modules/question/views/questionManager.html',
                controller: 'QuestionManagerCtrl'
            }
        }
    }).state('app.chat', {
        url: '/chat',
        abstract: true,
        views: {
            'menuContent': {
                templateUrl: 'modules/chat/views/chat-list.html',
                controller: 'ChatCtrl'
            }
        }
    }).state('app.chat.chatroom', {
        url: "/:id",
        views: {
            'chatroom': {
                templateUrl: "modules/chat/views/chatroom.html",
                controller: 'ChatRoomCtrl'
            }
        }
    });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/sign-in');
});
