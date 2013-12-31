app.directive('user', function($compile){
    return {
        restrict: 'A',
        link: function(scope, elem, attrs){
            // if (!elem.find('img').attr('popover')){
            //     elem.find('img').attr('popover-title', '{{ food.long_desc }}');
            //     elem.find('img').attr('popover-trigger', 'mouseenter');
            //     elem.find('img').attr('popover-popup-delay', '300');
            //     elem.find('img').attr('popover', 'This is a nice user');
            //     $compile(elem)(scope);
            // }
        }
    };
});