angular.module('Welcome')

.factory('UserService', function($http, ServerEndpoint){
    return {

        getUsers: function() {
            return $http({
                url: ServerEndpoint.url + "/user",
                method: "GET"
            });
        },

        getUser: function(id) {
            return $http({
                url: ServerEndpoint.url + "/user/" + id,
                method: "GET"
            });
        },

        getUserByEmail: function(email) {
            return $http({
                url: ServerEndpoint.url + "/user/email/" + email,
                method: "GET"
            });
        },

        postUser: function(user) {
            return $http({
                url: ServerEndpoint.url + "/user",
                method: "POST",
                data: user
            });
        },

        deleteUser: function(id) {
            return $http({
                url: ServerEndpoint.url + "/user/" + id,
                method: "DELETE"
            });
        }

    };
});
