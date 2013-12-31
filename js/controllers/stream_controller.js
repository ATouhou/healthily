app.controller('streamController', function($scope, $http, APIService, AuthService){
    $scope.newsfeed = [];

    $scope.$on('appReady', function(){
        APIService.getNewsfeed().then(function(response){
            // console.log('data recieved', response.data);
            // response.data.forEach(function(item, index){
            //     for(var versionKey in item.versions[0]){
            //         item[versionKey] = item.versions[0][versionKey];
            //     }
            //     delete item.versions;
            //     $scope.newsfeed[index] = item;
            // });
            $scope.newsfeed = response.data;
            console.log('scope newsfeed', $scope.newsfeed);
        }, function(response){

        });
    });

    $scope.$on('activityPosted', function(event, item){
        //add post to the top of the news feed
        item._creator = AuthService.getUser();
        $scope.newsfeed.unshift(item);
    });

    $scope.$on('newsfeedItemRemoved', function(event, _id){
        // console.log('removing activity with _id', _id);
        $scope.newsfeed = _($scope.newsfeed).reject(function(item){
            return item._id === _id;
        });
    });

});