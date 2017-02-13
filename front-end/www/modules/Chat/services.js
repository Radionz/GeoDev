angular.module('Chat')

.factory('ChatRoomService', function($http, ServerEndpoint){
  return {

    getAllChatRooms: function() {
      return $http({
        url: ServerEndpoint.url + "/chatroom",
        method: "GET"
      });
    },

    getChatRoom: function(id) {
      return $http({
        url: ServerEndpoint.url + "/chatroom/" + id,
        method: "GET"
      });
    },

    getChatRoomFromName: function(name) {
      return $http({
        url: ServerEndpoint.url + "/chatroom/name/" + name,
        method: "GET"
      });
    },

    postChatRoom: function(chat) {
      return $http({
        url: ServerEndpoint.url + "/chatroom",
        method: "POST",
        data: chat
      });
    },

    deleteChatRoom: function(id) {
      return $http({
        url: ServerEndpoint.url + "/chatroom/" + id,
        method: "DELETE"
      });
    },

    /////

    getAllChatRoomsMessages: function(id) {
      return $http({
        url: ServerEndpoint.url + "/chatroom/"+id+"/messages",
        method: "GET"
      });
    },

    getAllChatRoomsUsers: function(id) {
      return $http({
        url: ServerEndpoint.url + "/chatroom/"+id+"/users",
        method: "GET"
      });
    }

  };
})

.factory('MessagesService', function($http, ServerEndpoint){
  return {

    getAllMessages: function() {
      return $http({
        url: ServerEndpoint.url + "/message",
        method: "GET"
      });
    },

    getAllPersonalMessages: function(idUser) {
      return $http({
        url: ServerEndpoint.url + "/message/user/" + UserService.getUser(idUser),
        method: "GET"
      });
    },

    getMessage: function(id) {
      return $http({
        url: ServerEndpoint.url + "/message/" + id,
        method: "GET"
      });
    },

    postMessage: function(message) {
      return $http({
        url: ServerEndpoint.url + "/message",
        method: "POST",
        data: message
      });
    },

    deleteMessage: function(id) {
      return $http({
        url: ServerEndpoint.url + "/message/" + id,
        method: "DELETE"
      });
    }

  };
});
