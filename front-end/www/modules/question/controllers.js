angular.module('Question')

.controller('QuestionManagerCtrl', function($scope, QuestionService, ServerEndpoint) {

  var image = {
    url: 'img/question_marker.png',
    size: new google.maps.Size(16, 16),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(8, 8)
  };

  $scope.$on("$ionicView.enter", function(event, data){
    initMap();

    QuestionService.getQuestions().then(function(response) {
      var questions = response.data;
      $scope.questions = questions;
      angular.forEach(questions, function(question) {
        question.clue_image_url = ServerEndpoint.url + "/question/" + question._id + "/clue_image";
        addQuestionToMap(question);
      });
    });

    $scope.question = {};
    $scope.question.loc = {};
    $scope.question.answerType = "Text";
    $scope.question.radius = 150;
    $scope.question.loc.coordinates = [];
  });

  $('#questionImage').on('change', function (evt) {
    var files = $(evt.currentTarget).get(0).files;

    if(files.length > 0) {
      $('#questionImage').siblings('span').text(files[0].name);
      var formData = new FormData();
      formData.append('file', files[0]);
      $scope.question.formData = formData;
    }

  });

  $scope.createQuestion = function (question) {
    var formData = question.formData;
    delete question.clue_image;
    QuestionService.postQuestion(question).then(function(response) {
      var question = response.data;

      QuestionService.postQuestionImage(question._id, formData).then(function(response) {
        $scope.questions.push(question);
        addQuestionToMap(question);
      });
    });
  }

  function addYourLocationButton(map)
  {
    var controlDiv = document.createElement('div');

    var firstChild = document.createElement('button');
    firstChild.style.backgroundColor = '#fff';
    firstChild.style.border = 'none';
    firstChild.style.outline = 'none';
    firstChild.style.width = '28px';
    firstChild.style.height = '28px';
    firstChild.style.borderRadius = '2px';
    firstChild.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
    firstChild.style.cursor = 'pointer';
    firstChild.style.marginRight = '10px';
    firstChild.style.padding = '0px';
    firstChild.title = 'Your Location';
    controlDiv.appendChild(firstChild);

    var secondChild = document.createElement('div');
    secondChild.style.position = 'absolute';
    secondChild.style.top = '6px';
    secondChild.style.left = '6px';
    secondChild.style.width = '18px';
    secondChild.style.height = '18px';
    secondChild.style.backgroundImage = 'url(https://maps.gstatic.com/tactile/mylocation/mylocation-sprite-cookieless-v2-2x.png)';
    secondChild.style.backgroundSize = '180px 18px';
    secondChild.style.backgroundPosition = '0px 0px';
    secondChild.style.backgroundRepeat = 'no-repeat';
    secondChild.id = 'you_location_img';
    firstChild.appendChild(secondChild);

    google.maps.event.addListener(map, 'dragend', function() {
      $('#you_location_img').css('background-position', '0px 0px');
    });

    firstChild.addEventListener('click', function() {
      var imgX = '0';
      var animationInterval = setInterval(function(){
        if(imgX == '-18') imgX = '0';
        else imgX = '-18';
        $('#you_location_img').css('background-position', imgX+'px 0px');
      }, 500);
      if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          map.setCenter(latlng);
          clearInterval(animationInterval);
          $('#you_location_img').css('background-position', '-144px 0px');
        });
      }
      else{
        clearInterval(animationInterval);
        $('#you_location_img').css('background-position', '0px 0px');
      }
    });

    controlDiv.index = 1;
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlDiv);
  }

  function initMap() {
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

    addYourLocationButton($scope.map);
  }

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

    var contentString = '<div id="content">'+
    '<div id="siteNotice">'+
    '</div>'+
    '<h1 id="firstHeading" class="firstHeading">'+question.name+' ( '+question.nb_point+'pts )</h1>'+
    '<div id="bodyContent">'+
    '<p> Question: '+question.question+'</p>'+
    '<p> Answer : '+question.answer+'</p>'+
    '</div>'+
    '</div>';

    var infowindow = new google.maps.InfoWindow({
      content: contentString
    });

    marker.addListener('click', function() {
      infowindow.open($scope.map, marker);
    });
  }

  $scope.deleteQuestion = function (id, index) {
    QuestionService.deleteQuestion(id).then(function() {
      $scope.questions.splice(index, 1);
    });
  }

  $scope.centerOnQuestion = function (location) {
    var center = new google.maps.LatLng(location[1], location[0]);
    $scope.map.panTo(center);
  }
});
