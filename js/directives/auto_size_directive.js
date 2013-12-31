app.directive('autoSize', function(){
    return {
        restrict: 'A',
        link: function(scope, elem, attrs){
            elem.bind('input', function(){
                var text = elem.val();
                if (!text) text = elem.attr('placeholder');
                elem.attr('size', text.length);
            });
        }
    }
});