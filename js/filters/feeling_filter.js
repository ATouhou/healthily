app.filter('feeling', function(){
    var feelings = {
        'evil' : 'evilgrin',
        'excited': 'exciting'
    };
    return function(feeling){
        if (feelings.hasOwnProperty(feeling)) return feelings[feeling];
        return feeling;
    };
});