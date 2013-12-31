app.controller('foodController', function($scope, $modal, FoodService){
    $scope.food = {};
    $scope.nutrients = true;
    $scope.options = { nutrients_filter: {is_default: true} };
    // $scope.food.weight = 0;
    $scope.food.amount = 1;
    $scope.$watch('food._id', function(newVal){
        if (newVal){
            FoodService.getFood(newVal, $scope.food.weight, $scope.food.amount, $scope.nutrients)
            .success(function(food){
                $scope.food = food;
                // console.log('pw', $scope.food.weight);
                if ($scope.food.hasOwnProperty('nutrients')){
                    $scope.$watch('[food.amount, food.weight]', function(newVal){
                        // console.log('nw', newVal);
                        $scope.food = FoodService.calculate($scope.food);
                    }, true);
                }
            });
        }
    });
});