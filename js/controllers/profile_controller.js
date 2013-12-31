app.controller('profileController', function($scope, APIService){
    //TODO: add user
    APIService.getUser().success(function(response){
        $scope.user = response;
    });
});