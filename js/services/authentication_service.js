app.factory('AuthService', function($http){
    var authUsername = 'fwz';
    return {
        getUser: function(){
            return {username: 'fwz', name: {full: 'Muhammad Fawwaz Orabi'}};
        }
    }
});