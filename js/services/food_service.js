app.service('FoodService', function(APIService){
    var t = this;
    this.store = {};
    this.storeNutrients = function(){
        return APIService.getNutrients().success(function(response){
            t.store.nutrients = _(response).indexBy('_id');
            console.log('Nutrients', response);
            return response;
        });
    };
    this.getFood = function(ndb_no, weight, amount, nutrients){
        return APIService.getFood(ndb_no, nutrients).success(function(response){

            var food = response;
            food.amount = amount | 1;
            food.weight = food.weights[weight | 0];

            if (food.hasOwnProperty('nutrients')){
                food.nutrients = _(food.nutrients).indexBy('_id');
                _(food.nutrients).each(function(nutrient, index){
                    food.nutrients[index] = _.extend(nutrient, t.store.nutrients[index]);
                }); 
                food = t.calculate(food);
            }

            return food;
        });
    };
    this.calculate = function(food){
        var weight = food.weight;
        food.factor = food.amount / weight.amount;
        food.gm_wgt = weight.gm_wgt * food.factor;
        for (var index in food.nutrients){
            var nutr_quantity = food.nutrients[index].nutr_val * (weight.gm_wgt/100) * food.factor;
            food.nutrients[index].nutr_quantity = nutr_quantity;
        }
        return food;
    };
});