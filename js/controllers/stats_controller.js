app.controller('statsController', function($scope, APIService){
    //TODO: add user
    $scope.dates = {};
    APIService.getUserStats().success(function(response){
        $scope.stats = response;
        //$scope.stats.streak = _(response.streak).indexBy('_id');
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        $scope.dates.today = today;
        $scope.dates.tomorrow = tomorrow;
        $scope.stats.streak.forEach(function(item, index){
            // console.log('Today is', today.toLocaleString());
            item.last_extended = new Date(item.last_extended);
            // console.log('Last extended is', item.last_extended.toLocaleString());
            $scope.stats.streak[index].extended_today = item.last_extended >= today;
        });
        console.log($scope.stats);
    });
});