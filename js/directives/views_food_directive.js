app.directive('viewsFood', ['$modal', function($modal){
    return {
        link: function($scope, elem, attrs) {
            attrs.$observe('foodId', function(foodId){
                if (foodId){
                    elem.bind('click', function(event){
                        $scope.nutrients = true;
                        var m = $modal.open({
                            templateUrl: 'partials/food.html',
                            scope: $scope,
                            controller: 'modalController'
                        });
                    }); 
                }
            });
        }
    };
}]);