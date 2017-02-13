angular.module('Welcome')

.controller('WelcomeCtrl', function($scope, GameService, $rootScope, $interval, $timeout) {

  $scope.$on("$ionicView.enter", function(event, data){
    GameService.getGames($scope).then(function(response) {
      var games = response.data;

      //If the game is started we start the count down of play time remaining
      angular.forEach(games, function(game) {
        startCountDown(game, $interval);
      });

      $scope.games = games;
    });
  });

  function postDigest(callback){
    var unregister = $rootScope.$watch(function(){
      unregister();
      $timeout(function(){
        callback();
        postDigest(callback);
      },0,false);
    });
  }

  postDigest(function(){
    $('.profilePicture').initial();
  })

  $scope.alreadyIn = function (game) {
    var alreadyIn = false;
    angular.forEach(game.scoreBoard, function(scoreBoardEntry) {
      if (scoreBoardEntry.user._id == $rootScope.loggedInUser._id) {
        alreadyIn = true;
      }
    });
    return alreadyIn;
  }

  $scope.isFull = function (game) {
    return game.scoreBoard.length >= game.playerNb;
  }

  function startCountDown(game, $interval) {
    game.timeElapsed = "00:00:00";
    if (game.status == "STARTED") {
      var endTime = new Date(game.started_at).getTime() + (game.duration*60*1000);
      game.timeElapsed = new Date(endTime).getTime() - new Date().getTime() - 3600*1000;
      var watchTimeRemaining = $interval(function(){
        game.timeElapsed = new Date(endTime).getTime() - new Date().getTime() - 3600*1000;
        if(game.timeElapsed <= 0){
          $interval.cancel(watchTimeRemaining);
          GameService.endGame(game._id).then(function(response) {
            var game = response.data;
            stopCountDown(game);
            $scope.games[game.index] = game;
          });
        }
      }, 1000);
    }
  }

  $('.profilePicture').initial();
})



.controller('SignInCtrl', function($scope, $rootScope, $state, $ionicHistory, $ionicPopup, UserService) {

  $scope.$on("$ionicView.enter", function(event, data){
    initSkewTitle();

    if (typeof(Storage) !== "undefined" && localStorage.getItem("userId") !== null) {
      UserService.getUser(localStorage.getItem("userId")).then(function(response) {
        var user = response.data;
        delete user.password;
        $rootScope.loggedInUser = user;

        $ionicHistory.nextViewOptions({
          disableBack: true,
          disableAnimate: true
        });

        $state.go('app.welcome');
      });
    }

    $scope.user = {};
  });

  $scope.signIn = function (user) {
    UserService.getUserByEmail(user.username).then(function(response) {
      var user = response.data;
      if (user == null) {
        $ionicPopup.alert({
          title: "Username or password invalid",
          template: "Please check your credentials"
        });
      }else {
        delete user.password;
        $rootScope.loggedInUser = user;

        if (typeof(Storage) !== "undefined") {
          localStorage.setItem("userId", $rootScope.loggedInUser._id);
        }

        $ionicHistory.nextViewOptions({
          disableBack: true
        });

        $state.go('app.welcome');
      }
    });
  };

})

.controller('SignUpCtrl', function($scope, $state, $ionicHistory, UserService) {

  $scope.$on("$ionicView.enter", function(event, data){
    $scope.user = {};
  });

  $scope.signUp = function(user) {

    UserService.postUser(user).then(function(response) {
      var user = response.data;

      $ionicHistory.nextViewOptions({
        disableBack: true,
        disableAnimate: true
      });

      $state.go('app.signIn');
    });
  }

})

.controller('ForgotPasswordCtrl', function($scope) {

  $scope.$on("$ionicView.enter", function(event, data){

  });

});
