app.factory('APIService', function($http){
    var authUsername = 'fwz';
    return {
        getUser: function(){
            return $http.get('/api/users/' + authUsername);
        },
        getUserStats: function(){
            return $http.get('/api/users/' + authUsername + '/stats');
        },
        getNewsfeed: function(){
            return $http.get('/api/users/' + authUsername + '/newsfeed/');
        },
        getFood: function(ndb_no, nutrients){
            return $http.get('/api/nutridb/foods/' + ndb_no + (nutrients ? '?nutrients=1' : ''), { cache: true });
        },
        getNutrients: function(){
            return $http.get('/api/nutridb/nutrients', { cache: true });
        },
        like: function(username, activityId){
            return $http.post('/api/users/' + username + '/activities/' + activityId + '/likes');
        },
        unlike: function(username, activityId){
            return $http.delete('/api/users/' + username + '/activities/' + activityId + '/likes/' + authUsername);
        }
    }
});