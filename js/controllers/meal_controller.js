app.controller('mealController', function($scope, FoodService, $modal){
    $scope.meal = [];
    $scope.total = {};
    $scope.$watch($scope.meal.contents, function(){
        $scope.meal.contents.forEach(function(mealItem, index){
            FoodService.getFood(mealItem._id, mealItem.weight, mealItem.amount, true).success(function(food){
                $scope.meal.contents[index] = food;
                for (var tagname in food.nutrients){
                    if (typeof $scope.total[tagname] === 'undefined'){
                        $scope.total[tagname] = {
                            nutr_quantity: 0, 
                            nutrdesc: food.nutrients[tagname].nutrdesc, 
                            is_default: food.nutrients[tagname].is_default
                        };
                    }
                    $scope.total[tagname].nutr_quantity += food.nutrients[tagname].nutr_quantity;
                }
            });
        });
        console.log($scope.total);
    });

    $scope.showNutrients = function(){
        // alert('Going to show nutrients!');
        var m = $modal.open({
            templateUrl: 'partials/meal_details.html',
            scope: $scope,
            controller: 'modalController'
        });
    };
});