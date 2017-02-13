angular.module('Game')

.controller('ChatPopupCtrl', function($scope, GameService, $rootScope, $interval, $timeout, $ionicScrollDelegate,
  $ionicHistory, UserService, ChatRoomService, ServerEndpoint, $stateParams) {

    var chatId, isIOS = ionic.Platform.isWebView() && ionic.Platform.isIOS();
    $scope.data = {};

    if (typeof(Storage) !== "undefined" && localStorage.getItem("userId") !== null) {
      $scope.myId = localStorage.getItem("userId");
    }

    // EVENTS HERE //

    var updateUsers = function(users) {
      var unique = users.filter(function(elem, index, self) {
        return index == self.indexOf(elem);
      });
      $scope.users = unique;
      $scope.$apply();
      $('.profilePicture').initial();
      $ionicScrollDelegate.scrollBottom(false);
    };

    var updateMessage = function(message) {
      $scope.messages.push(message);
      $scope.$apply();
      $('.profilePicture').initial();
      $ionicScrollDelegate.scrollBottom(true);
    };

    var updateMessages = function(messages) {
      $scope.messages = [];
      messages.forEach(function(message){
        if (((new Date) - new Date(message.time)) >  24 * 60 * 60 * 1000) {
          message.isOlderThanOneDay = true;
        }
        $scope.messages.push(message);
      });

      $ionicScrollDelegate.scrollBottom(false);
    };

    // fINISH EVENTS //

    $rootScope.socket.on('messages', updateMessages);
    $rootScope.socket.on('message', updateMessage);
    $rootScope.socket.on('users', updateUsers);

    $scope.sendMessage = function() {

      var date = new Date();
      date = date.toLocaleTimeString().replace(/:\d+ /, ' ');

      $scope.socket.emit('message', {
        userFrom: $scope.myId,
        userFromName: $rootScope.loggedInUser.name,
        text: $scope.data.message,
        time: new Date()
      });
      $scope.data = {};
      $ionicScrollDelegate.scrollBottom(true);
    };

    $scope.inputUp = function() {
      if (isIOS) $scope.data.keyboardHeight = 216;
      $timeout(function() {
        $ionicScrollDelegate.scrollBottom(true);
      }, 300);

    };
    $scope.$on("modal.shown", function(event, data){

      if (data.el.innerHTML.indexOf("chatModal") < 0) {
        return;
      }

      if (typeof(Storage) !== "undefined" && localStorage.getItem("userId") !== null) {
        $scope.myId = localStorage.getItem("userId");

        GameService.getGame($stateParams.id)
        .then(function(response) {

          var roomName = response.data.name;
          ChatRoomService.getChatRoomFromName("ChatRoom " + roomName)
          .then(function(chats) {

            if (chats.data.length === 0) {
              console.log("No room to join founded");
              return;
            }

            chatId = chats.data[0]._id;
            // Create request for joining room
            var req = {
              chatId : chatId,
              userId : $scope.myId
            }
            $rootScope.socket.emit('newclient', req);

          });
        });

      }
      else {
        console.log("You haven't an ID. Can't open the chat");
      }


      $scope.inputUp = function() {
        if (isIOS) $scope.data.keyboardHeight = 216;
        $timeout(function() {
          $ionicScrollDelegate.scrollBottom(true);
        }, 300);

      };

      $scope.inputDown = function() {
        if (isIOS) $scope.data.keyboardHeight = 0;
        $ionicScrollDelegate.resize();
      };

      $scope.closeKeyboard = function() {
        // cordova.plugins.Keyboard.close();
      };
    });

    $scope.$on('modal.hidden', function(event, data) {

      if (data.el.innerHTML.indexOf("chatModal") < 0) {
        return;
      }

      var req = {
        chatId : chatId,
        userId : $scope.myId
      }
      $rootScope.socket.removeListener('users', updateUsers);
      $rootScope.socket.removeListener('message', updateMessage);
      $rootScope.socket.removeListener('messages', updateMessages);
      $rootScope.socket.emit('leaveChatroom', req);
    });
  })

  .controller('GameCtrl', function($scope, $rootScope, $state, GameService, QuestionService, UserService, $stateParams, $ionicModal, $ionicPopup, ChatRoomService,$ionicScrollDelegate, $timeout, ServerEndpoint) {

    $('.scroll').height('100%');

    var styles = [ { "elementType": "geometry", "stylers": [ { "color": "#ebe3cd" } ] }, { "elementType": "labels.text.fill", "stylers": [ { "color": "#523735" } ] }, { "elementType": "labels.text.stroke", "stylers": [ { "color": "#f5f1e6" } ] }, { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [ { "color": "#c9b2a6" } ] }, { "featureType": "administrative.land_parcel", "elementType": "geometry.stroke", "stylers": [ { "color": "#dcd2be" } ] }, { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [ { "color": "#ae9e90" } ] }, { "featureType": "landscape.natural", "elementType": "geometry", "stylers": [ { "color": "#dfd2ae" } ] }, { "featureType": "poi", "elementType": "geometry", "stylers": [ { "color": "#dfd2ae" } ] }, { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [ { "color": "#93817c" } ] }, { "featureType": "poi.business", "stylers": [ { "visibility": "off" } ] }, { "featureType": "poi.government", "stylers": [ { "visibility": "off" } ] }, { "featureType": "poi.medical", "stylers": [ { "visibility": "off" } ] }, { "featureType": "poi.park", "elementType": "geometry.fill", "stylers": [ { "color": "#a5b076" } ] }, { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [ { "color": "#447530" } ] }, { "featureType": "poi.place_of_worship", "stylers": [ { "visibility": "off" } ] }, { "featureType": "poi.sports_complex", "stylers": [ { "visibility": "off" } ] }, { "featureType": "road", "elementType": "geometry", "stylers": [ { "color": "#f5f1e6" } ] }, { "featureType": "road.arterial", "elementType": "geometry", "stylers": [ { "color": "#fdfcf8" } ] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [ { "color": "#f8c967" } ] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [ { "color": "#e9bc62" } ] }, { "featureType": "road.highway.controlled_access", "elementType": "geometry", "stylers": [ { "color": "#e98d58" } ] }, { "featureType": "road.highway.controlled_access", "elementType": "geometry.stroke", "stylers": [ { "color": "#db8555" } ] }, { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [ { "color": "#806b63" } ] }, { "featureType": "transit", "stylers": [ { "visibility": "off" } ] }, { "featureType": "transit.line", "elementType": "geometry", "stylers": [ { "color": "#dfd2ae" } ] }, { "featureType": "transit.line", "elementType": "labels.text.fill", "stylers": [ { "color": "#8f7d77" } ] }, { "featureType": "transit.line", "elementType": "labels.text.stroke", "stylers": [ { "color": "#ebe3cd" } ] }, { "featureType": "transit.station", "elementType": "geometry", "stylers": [ { "color": "#dfd2ae" } ] }, { "featureType": "water", "elementType": "geometry.fill", "stylers": [ { "color": "#b9d3c2" } ] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [ { "color": "#92998d" } ] } ];
    var image = {
      url: 'img/question_marker.png',
      size: new google.maps.Size(16, 16),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(8, 8)
    };

    $scope.$on("$ionicView.enter", function(event, data){

      // CHAT HERE //

      // CHAT HERE //


      if (typeof $rootScope.loggedInUser === "undefined") {
        $state.go("app.signIn");
      }else {
        initMap();

        var gameId = $stateParams.id;
        GameService.getGame(gameId).then(function(response) {
          var game = response.data;

          UserService.getUser($rootScope.loggedInUser._id).then(function(response) {
            var user = response.data;
          });

          var alreadyIn = false;
          angular.forEach(game.scoreBoard, function(scoreBoardEntry) {
            if (scoreBoardEntry.user._id == $rootScope.loggedInUser._id) {
              alreadyIn = true;
              return;
            }
          });

          if (!alreadyIn) {
            var scoreBoardEntry = {};
            scoreBoardEntry.user = {};
            scoreBoardEntry.user._id = $rootScope.loggedInUser._id;
            scoreBoardEntry.score = 0;
            scoreBoardEntry.loc = {};
            scoreBoardEntry.loc.coordinates = [];
            game.scoreBoard.push(scoreBoardEntry);

            GameService.putGame(game).then(function(response) {
            });
          }

          game.questionsBody = [];
          angular.forEach(game.questions, function(questionId) {
            QuestionService.getQuestion(questionId).then(function(response) {
              var question = response.data;
              game.questionsBody.push(question);

              question.clue_image_url = ServerEndpoint.url + "/question/" + question._id + "/clue_image";

              addQuestionToMap(question);
            });
          });

          $scope.game = game;
        });

        $scope.$on("$ionicView.leave", function(event, data){

        });
      }
    });

    $scope.getUser = function(userId){
      var currentUser;
      UserService.getUser(userId).then(function(response){
        currentUser = response.data;
      });
      return currentUser.name;
    }


    function initMap() {

      var styledMap = new google.maps.StyledMapType(styles, {name: "Styled Map"});

      $scope.map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 43.6221174, lng: 7.0391009},
        streetViewControl: false,
        mapTypeControlOptions: {
          mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
        },
        zoom: 14
      });
      //Associate the styled map with the MapTypeId and set it to display.
      $scope.map.mapTypes.set('map_style', styledMap);
      $scope.map.setMapTypeId('map_style');
      addYourLocationButton($scope.map);

      $ionicModal.fromTemplateUrl('modules/game/views/modal-scoreBoard.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modalScoreBoard) {
        $scope.modalScoreBoard = modalScoreBoard;
      });

      $ionicModal.fromTemplateUrl('modules/game/views/modal-chat.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modalChat) {
        $scope.modalChat = modalChat;
      });

      addViewScoreBoardButton($scope.map).addEventListener('click', function() {
        $scope.modalScoreBoard.show();
      });

      addViewChatButton($scope.map).addEventListener('click', function() {
        $scope.modalChat.show();
      });
    };

    function addQuestionToMap(question) {
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(question.loc.coordinates[1], question.loc.coordinates[0]),
        map: $scope.map,
        icon: image,
        title: question.name,
        animation: google.maps.Animation.DROP
      });

      var circle = new google.maps.Circle({
        map: $scope.map,
        center: marker.position,
        radius: question.radius,    // 10 miles in metres
        fillColor: '#AA0000',
        fillOpacity: 0.5
      });
      //circle.bindTo('center', marker, 'position');

      var contentString = '<div id="content">'+
      '<h1 id="firstHeading" class="firstHeading">'+question.name+' ('+question.nb_point+' pts)</h1>'+
      '<img src="'+question.clue_image_url+'" alt="clue image" style="max-width: 500px;"/>'+
      '</div>';

      var infowindow = new google.maps.InfoWindow({
        content: contentString
      });

      marker.addListener('click', function() {
        infowindow.open($scope.map, marker);
      });

      $rootScope.changeInputImage = function (evt) {
        console.log("here");
        var files = evt.files;

        if(files.length > 0) {
          $('#questionImage').siblings('span').text(files[0].name);
          var formData = new FormData();
          formData.append('file', files[0]);
          $scope.data.formData = formData;
        }
      };
    };

    var open = false,
    questionPopUp = null;

    $scope.$on("newPosition", function(event, latlng){
      console.log("onNewPos");
      // Update player position
      angular.forEach($scope.game.scoreBoard, function(scoreBoardEntry){
        if(scoreBoardEntry.user._id == $rootScope.loggedInUser._id){
          scoreBoardEntry.loc = {};
          scoreBoardEntry.loc.coordinates = [];
          scoreBoardEntry.loc.coordinates[0] = latlng.lng();
          scoreBoardEntry.loc.coordinates[1] = latlng.lat();

          GameService.putScoreBoardEntry($scope.game, scoreBoardEntry).then(function(response){
          });
        }
      });

      console.log($scope.game);
      // Check you're in question circle
      angular.forEach($scope.game.questionsBody, function(question) {

        var questionPosition = new google.maps.LatLng(question.loc.coordinates[1], question.loc.coordinates[0]);

        var distance = google.maps.geometry.spherical.computeDistanceBetween(latlng, questionPosition);

        console.log(question._id)
        console.log(!open ,!isQuestionAnswered(question._id, $rootScope.loggedInUser._id) , distance <= question.radius);
        if(!open && !isQuestionAnswered(question._id, $rootScope.loggedInUser._id) && distance <= question.radius){

          $scope.data = {};

          open = true;

          if (question.answerType == "Text") {
            $scope.popupInput = '<input id="inputText" type="text" ng-model="data.answer">';
          }
          if (question.answerType == "Picture") {
            $scope.popupInput = '<label id="inputPicture" class="fileUpload item-input  button button-block button-positive" style="margin : 10px 0px;">'+
            '<i class="icon ion-image"></i>'+
            '<span> Send a picture to answer</span>'+
            '<input class="upload button button-block button-positive" style="margin-left : 0px;" type="file" accept="image/*" id="questionImage" onchange="angular.element(this).scope().changeInputImage(this)">'+
            '</label>';
          }

          questionPopUp = new $ionicPopup.show({
            template: ''+
            '<img src="'+question.clue_image_url+'" alt="clue image" style="max-width: 480px; margin: auto; margin-bottom: 15px; display: block;"/>'+
            '<p>Your answer</p>'+
            $scope.popupInput,
            title: question.name,
            subTitle: question.question,
            scope: $scope,
            buttons: [
              {
                text: '<b>Send my Answer</b>',
                type: 'button-positive',
                onTap: function(e) {
                  submitAnswer($rootScope.loggedInUser._id, question);

                }
              }
            ]
          });

          questionPopUp.then(function(res) {
            open = false;

            var alertPopup = new $ionicPopup.alert({
              title: 'Yes ! Response is saved',
              template: 'The game master will examine your answer !'
            });

            alertPopup.then(function(res) {
              open = false;
            });


          });
        }

      });

    });



    function isQuestionAnswered(questionId, userId){
      var found = false;
      angular.forEach($scope.game.scoreBoard, function(scoreBoardEntry){
        if(scoreBoardEntry.user._id == userId){
          angular.forEach(scoreBoardEntry.questionsAnswered, function(questionAnswered){
            if (questionId == questionAnswered.questionId && questionAnswered.status != "NOT_ANSWERED") {
              console.log("true");
              found =  true;
            }
          });
        }
      });
      return found;
    }

    function submitAnswer(userId, question){

      angular.forEach($scope.game.scoreBoard, function(scoreBoardEntry){
        if(scoreBoardEntry.user._id == userId){
          scoreBoardEntry.questionsAnswered = {};
          scoreBoardEntry.questionsAnswered.questionId = question._id;
          if (question.answerType == "Text") {
            scoreBoardEntry.questionsAnswered.answer = $scope.data.answer;
          }
          if (question.answerType == "Picture") {
            scoreBoardEntry.questionsAnswered.answer = $scope.game._id + "-" + question._id + "-" + userId + ".jpg";
          }
          scoreBoardEntry.questionsAnswered.status = "ANSWERED";
          console.log(scoreBoardEntry);
          GameService.putScoreBoardEntry($scope.game, scoreBoardEntry).then(function(response){
            $scope.game = response.data;

            $scope.game.questionsBody = [];
          angular.forEach($scope.game.questions, function(questionId) {
            QuestionService.getQuestion(questionId).then(function(response) {
              var question = response.data;
              $scope.game.questionsBody.push(question);

              angular.forEach($scope.game.scoreBoard, function(player) {
                angular.forEach(player.questionsAnswered, function(questionAnswered) {
                  if (questionAnswered.questionId == question._id) {
                    questionAnswered.questionBody = question;
                  }
                });
              });

              question.clue_image_url = ServerEndpoint.url + "/question/" + question._id + "/clue_image";

              addQuestionToMap(question);
            });
          });
          });

          return;
        }
      });

      // Game.postAnswerImage($scope.game._id, userId, question._id, formData).then(function(response) {
      //   $scope.questions.push(question);
      //   addQuestionToMap(question);
      // });

      // angular.forEach($scope.game.scoreBoard, function(scoreBoardEntry){
      //   if(scoreBoardEntry.user._id == userId){
      //     scoreBoardEntry.score = scoreBoardEntry.score+question.nb_points;
      //     scoreBoardEntry.questionsAnswered.push(question.id);
      //     return;
      //   }
      // });
    }
    // Utils function
    function addYourLocationButton(map) {
      var controlDiv = document.createElement('div');

      var controlUI = document.createElement('button');
      controlUI.style.backgroundColor = '#fff';
      controlUI.style.border = 'none';
      controlUI.style.outline = 'none';
      controlUI.style.width = '28px';
      controlUI.style.height = '28px';
      controlUI.style.borderRadius = '2px';
      controlUI.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
      controlUI.style.cursor = 'pointer';
      controlUI.style.marginRight = '10px';
      controlUI.style.padding = '0px';
      controlUI.title = 'Your Location';
      controlDiv.appendChild(controlUI);

      var controlText = document.createElement('div');
      controlText.style.position = 'absolute';
      controlText.style.top = '6px';
      controlText.style.left = '6px';
      controlText.style.width = '18px';
      controlText.style.height = '18px';
      controlText.style.backgroundImage = 'url(https://maps.gstatic.com/tactile/mylocation/mylocation-sprite-cookieless-v2-2x.png)';
      controlText.style.backgroundSize = '180px 18px';
      controlText.style.backgroundPosition = '0px 0px';
      controlText.style.backgroundRepeat = 'no-repeat';
      controlText.id = 'you_location_img';
      controlUI.appendChild(controlText);

      google.maps.event.addListener(map, 'dragend', function() {
        $('#you_location_img').css('background-position', '0px 0px');
      });

      controlUI.addEventListener('click', function() {
        var imgX = '0';
        var animationInterval = setInterval(function(){
          if(imgX == '-18') imgX = '0';
          else imgX = '-18';
          $('#you_location_img').css('background-position', imgX+'px 0px');
        }, 500);
        var watchId;
        var imageTeamOnMap = {
          url: 'img/question_marker.png',
          size: new google.maps.Size(16, 16),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(8, 8)
        };
        var marker = new google.maps.Marker({
          map: map,
          clickable : false,
          icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            strokeColor : '#3333FF',
            strokeWeight : 5,
            scale: 2.5
          },
          shadow : null,
          zIndex : 999
        });

        if(navigator.geolocation) {
          watchId = navigator.geolocation.watchPosition( function(position){
            var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            map.panTo(latlng);
          console.log("newPos");

            $scope.$emit("newPosition",latlng);
            marker.setPosition(latlng);
            clearInterval(animationInterval);
            $('#you_location_img').css('background-position', '-144px 0px');
          }, null, {enableHighAccuracy:true});

          function enableOrientationArrow() {

            if (window.DeviceOrientationEvent) {

              window.addEventListener('deviceorientation', function(event) {
                var alpha = null;
                //Check for iOS property
                if (event.webkitCompassHeading) {
                  alpha = event.webkitCompassHeading;
                }
                //non iOS
                else {
                  alpha = event.alpha;
                }
                var locationIcon = marker.get('icon');
                locationIcon.rotation = 360 - alpha;
                marker.set('icon', locationIcon);
              }, false);
            }
          }

        }
        else{
          clearInterval(animationInterval);
          $('#you_location_img').css('background-position', '0px 0px');
        }
      });

      controlDiv.index = 1;
      map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlDiv);
    }

    function addViewScoreBoardButton(map) {
      var controlDiv = document.createElement('div');
      // Set CSS for the control border.
      var controlUI = document.createElement('div');
      controlUI.style.backgroundColor = '#fff';
      controlUI.style.backgroundColor = '#fff';
      controlUI.style.border = '2px solid #fff';
      controlUI.style.borderRadius = '3px';
      controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
      controlUI.style.cursor = 'pointer';
      controlUI.style.marginBottom = '22px';
      controlUI.style.textAlign = 'center';
      controlUI.title = 'Click to show the scoreboard';
      controlDiv.appendChild(controlUI);

      // Set CSS for the control interior.
      var controlText = document.createElement('div');
      controlText.style.color = 'rgb(25,25,25)';
      controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
      controlText.style.fontSize = '16px';
      controlText.style.lineHeight = '38px';
      controlText.style.paddingLeft = '5px';
      controlText.style.paddingRight = '5px';
      controlText.innerHTML = 'ScoreBoard';
      controlUI.appendChild(controlText);

      controlDiv.index = 1;
      map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(controlDiv);

      return controlUI;
    }

    function addViewChatButton(map) {
      var controlDiv = document.createElement('div');
      // Set CSS for the control border.
      var controlUI = document.createElement('div');
      controlUI.style.backgroundColor = '#fff';
      controlUI.style.backgroundColor = '#fff';
      controlUI.style.border = '2px solid #fff';
      controlUI.style.borderRadius = '3px';
      controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
      controlUI.style.cursor = 'pointer';
      controlUI.style.marginBottom = '22px';
      controlUI.style.marginLeft = '22px';
      controlUI.style.textAlign = 'center';
      controlUI.title = 'Click to show the chat';
      controlDiv.appendChild(controlUI);

      // Set CSS for the control interior.
      var controlText = document.createElement('div');
      controlText.style.color = 'rgb(25,25,25)';
      controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
      controlText.style.fontSize = '16px';
      controlText.style.lineHeight = '38px';
      controlText.style.paddingLeft = '5px';
      controlText.style.paddingRight = '5px';
      controlText.innerHTML = 'Chat';
      controlUI.appendChild(controlText);

      controlDiv.index = 1;
      map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(controlDiv);

      return controlUI;
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

    function stopCountDown(game) {
      game.timeElapsed = "00:00:00";
    }
  })

  .controller('GameManagerCtrl', function($scope, $interval, GameService, QuestionService, ChatRoomService) {

    $scope.$on("$ionicView.enter", function(event, data){
      GameService.getGames().then(function(response) {
        var games = response.data;

        //If the game is started we start the count down of play time remaining
        angular.forEach(games, function(game) {
          startCountDown(game, $interval);
        });

        $scope.games = games;
      });

      QuestionService.getQuestions().then(function(response) {
        var questions = response.data;
        $scope.questions = questions;
      });

      $scope.initForm();
    });

    $scope.initForm = function () {
      $scope.formGame = {};
      angular.forEach($scope.questions, function(question) {
        question.checked = false;
      });
      $scope.formGame.duration = 90;
      $scope.formGame.playerNb = 5;
    }

    $scope.questionSelected = function () {
      $scope.formGame.questions = [];
      angular.forEach($scope.questions, function(value, key) {
        if (value.checked == true) {
          $scope.formGame.questions.push(value._id);
        }
      });
    };

    $scope.createGame = function (game) {
      GameService.postGame(game).then(function(response) {
        var game = response.data;
        startCountDown(game, $interval);
        $scope.games.push(game);
        $scope.initForm();

        var chatRoom = {
          name: "ChatRoom " + game.name,
          users: [],
          messages: []
        }
        ChatRoomService.postChatRoom(chatRoom);
      });
    };

    $scope.startGame = function (game, index) {
      GameService.startGame(game._id).then(function(response) {
        var game = response.data;
        startCountDown(game, $interval);
        $scope.games[index] = game;
      });
    };

    $scope.stopGame = function (game, index) {
      GameService.stopGame(game._id).then(function(response) {
        var game = response.data;
        stopCountDown(game);
        $scope.games[index] = game;
      });
    };

    $scope.updateGameInForm = function (game, index) {
      $scope.initForm();
      game.index = index;
      angular.forEach(game.questions, function(questionId) {
        angular.forEach($scope.questions, function(question) {
          if (question._id == questionId) {
            question.checked = true;
          }
        });
      });
      $scope.formGame = angular.copy(game);
    };

    $scope.updateGame = function (game) {
      var index = game.index;
      game.status = "NOT_STARTED";
      GameService.putGame(game).then(function(response) {
        var game = response.data;
        stopCountDown(game);
        $scope.games[index] = game;
        $scope.initForm();
      });
    };

    $scope.deleteGame = function (id, index) {
      GameService.deleteGame(id).then(function(response) {
        $scope.games.splice(index, 1);
        ChatRoomService.getChatRoomFromName("ChatRoom " +response.data.name)
        .then(function(data) {
          ChatRoomService.deleteChatRoom(data.data[0]._id);
        });
      });
    };



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

    function stopCountDown(game) {
      game.timeElapsed = "00:00:00";
    }
  })

  .controller('GameAdminCtrl', function($scope, $interval, GameService, QuestionService, ServerEndpoint) {

    var image_question = {
      url: 'img/question_marker.png',
      size: new google.maps.Size(16, 16),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(8, 8)
    };

    var image_user = {
      url: 'img/user_marker.png',
      size: new google.maps.Size(24, 24),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(12, 12)
    };

    var markers = []
    players = [],
    interval = null;

    $scope.$on("$ionicView.enter", function(event, data){
      GameService.getGames().then(function(response) {
        var games = response.data;

        //If the game is started we start the count down of play time remaining
        angular.forEach(games, function(game) {
          startCountDown(game, $interval);
        });

        $scope.games = games;
      });

      $scope.initMap();
    });

    $scope.changeGameSelected = function (game) {

      $scope.game = game;

      for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
      }
      markers = [];

      clearInterval(interval);
      interval = setInterval(function () {
        GameService.getGame(game._id).then(function(response) {
          $scope.game = response.data;
        });
        for (var i = 0; i < players.length; i++) {
          players[i].setMap(null);
        }
        players = [];

        angular.forEach(game.scoreBoard, function(player) {
          addPlayerToMap(player);
        });
      },30000);

      game.questionsBody = [];
      angular.forEach(game.questions, function(questionId) {
        QuestionService.getQuestion(questionId).then(function(response) {
          var question = response.data;
          game.questionsBody.push(question);

          angular.forEach(game.scoreBoard, function(player) {
            angular.forEach(player.questionsAnswered, function(questionAnswered) {
              if (questionAnswered.questionId == question._id) {
                questionAnswered.questionBody = question;
              }
            });
          });

          question.clue_image_url = ServerEndpoint.url + "/question/" + question._id + "/clue_image";

          addQuestionToMap(question);
        });
      });

    }

    $scope.initMap = function () {
      $scope.map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 43.6221174, lng: 7.0391009},
        streetViewControl: false,
        zoom: 14
      });

      google.maps.event.addListener($scope.map, 'click', function( event ){
        $scope.question.loc.coordinates[0] = event.latLng.lng();
        $( "input[placeholder='Longitude']" ).val(event.latLng.lng());
        $( "input[placeholder='Longitude']" ).siblings('span').addClass('has-input');

        $scope.question.loc.coordinates[1] = event.latLng.lat();
        $( "input[placeholder='Latitude']" ).val(event.latLng.lat());
        $( "input[placeholder='Latitude']" ).siblings('span').addClass('has-input');
      });
    }

    function addPlayerToMap(player) {
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(player.loc.coordinates[1], player.loc.coordinates[0]),
        map: $scope.map,
        icon: image_user,
        title: player.user.name
      });

      var contentString = '<div id="content">'+
      '<h1 id="firstHeading" class="firstHeading">'+player.user.name+' ( '+player.score+'pts )</h1>'+
      '<div id="bodyContent">'+
      '</div>'+
      '</div>';

      var infowindow = new google.maps.InfoWindow({
        content: contentString
      });

      marker.addListener('click', function() {
        infowindow.open($scope.map, marker);
      });

      players.push(marker);
    }

    function addQuestionToMap(question) {
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(question.loc.coordinates[1], question.loc.coordinates[0]),
        map: $scope.map,
        icon: image_question,
        title: question.name
      });

      var circle = new google.maps.Circle({
        map: $scope.map,
        center: marker.position,
        radius: question.radius,    // 10 miles in metres
        fillColor: '#AA0000',
        fillOpacity: 0.5
      });

      var contentString = '<div id="content">'+
      '<div id="siteNotice">'+
      '</div>'+
      '<h1 id="firstHeading" class="firstHeading">'+question.name+' ( '+question.nb_point+'pts )</h1>'+
      '<div id="bodyContent">'+
      '<p> Question: '+question.question+'</p>'+
      '<p> Answer : '+question.answer+'</p>'+
      '<img src="'+question.clue_image_url+'" alt="clue image" style="max-width: 400px;"/>'+
      '</div>'+
      '</div>';

      var infowindow = new google.maps.InfoWindow({
        content: contentString
      });

      marker.addListener('click', function() {
        infowindow.open($scope.map, marker);
      });

      markers.push(marker);
      markers.push(circle);
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
  });
