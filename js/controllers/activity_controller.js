app.controller('activityController', function($scope, $rootScope, APIService){
    $scope.remove = function(){
        // alert('To be removed');
        // console.log($scope.activity);
        $rootScope.$broadcast('newsfeedItemRemoved', $scope.activity._id);
        //TODO
    };

    $scope.like = function(){
        APIService.like($scope.activity._creator.username, $scope.activity._id).error(function(){
            // $scope.activity.likes.push({_creator: })
            alert('error liking activity');
        });
    };

    $scope.unlike = function(){
        APIService.unlike($scope.activity._creator.username, $scope.activity._id).error(function(){
            // $scope.activity.likes.push({_creator: })
            alert('error unliking activity');
        });
    };

    $scope.comment = function(){

    };

    $scope.share = function(){

    }

    $scope.edit = function(){

    };

    $scope.removeComment = function(){

    };
});