app.directive('autoDirection', function(LocalizationService){
    return {
        restrict: 'A',
        link: function(scope, elem, attrs){
            attrs.$observe('autoDirection', function(text){
                elem.attr('dir', LocalizationService.isRTL(text) ? 'rtl' : 'ltr');
            });
        }
    }
});