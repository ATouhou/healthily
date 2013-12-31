app.filter('absolute', function(){
    return function(number){
        if (number < 0) return -1 * number;
        return number;
    }
});