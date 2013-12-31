app.directive('hasFoodPopover', function($compile){
    return {
        link: function(scope, elem, attrs){
            if (!elem.attr('popover')){
                elem.attr('popover-title', '{{ food.long_desc }}');
                elem.attr('popover-trigger', 'mouseenter');
                elem.attr('popover', 'This is a nice food');
                $compile(elem)(scope);
            }
        }
    };
});