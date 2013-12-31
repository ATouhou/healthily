app.directive('composer', function(){
    return {
        controller: 'composerController',
        link: function($scope, elem, attrs, controller) {
            var textarea = elem.find('textarea');
            textarea.css('height', 'auto');
            
            var attachments = elem.find('attachments');
            var controlset = elem.find('control-set');
            
            var reset = function(){
                textarea.attr('rows', '1');
                attachments.css('display', 'none');
                controlset.css('display', 'none');
            }

            var init = false;

            textarea.bind('focus', function(){
                elem.addClass('focused');
                if (!init){
                    textarea.attr('rows', '2');
                    attachments.css('display', 'inherit');
                    controlset.css('display', 'inherit');
                    init = true;
                }
            });

            textarea.bind('blur', function(){
                elem.removeClass('focused');
            });

            reset();
        }
    };
});

// .directive('', ['', function(){
//     // Runs during compile
//     return {
//         // name: '',
//         // priority: 1,
//         // terminal: true,
//         // scope: {}, // {} = isolate, true = child, false/undefined = no change
//         // cont­rol­ler: function($scope, $element, $attrs, $transclue) {},
//         // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
//         restrict: 'A',
//         // template: '',
//         templateUrl: '',
//         replace: true,
//         // transclude: true,
//         // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
//         link: function($scope, iElm, iAttrs, controller) {
            
//         }
//     };
// }]);