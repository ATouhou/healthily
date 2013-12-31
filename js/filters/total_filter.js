app.filter('total', function(){
    return function(items, key){
        var total = 0;
        items.forEach(function(item){
            total += item[key];
        });
        return total;
    };
});