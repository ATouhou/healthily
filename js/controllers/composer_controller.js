app.controller('composerController', function($scope, $http, $rootScope){

    $scope.status = {
        attachments: [],
    };

    $scope.submit = function(){
        $scope.activity.created = new Date();
        $scope.activity.type = 'post';
        $http.post('/api/users/fwz/activities/', $scope.activity).success(function(response){
            $rootScope.$broadcast('activityPosted', _.clone($scope.activity));
        }).error(function(response){
            alert('error!');
        });
    }

});