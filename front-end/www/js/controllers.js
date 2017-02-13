angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicHistory, $rootScope, $state) {

  $scope.signOut = function() {
    delete $rootScope.loggedInUser;
    localStorage.removeItem("userId");

    $ionicHistory.nextViewOptions({
      disableBack: true
    });

    $state.go('app.signIn');
  }
});
