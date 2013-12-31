app.controller('offlineController', function($scope, $log, $modalInstance){
    
    $scope.step = null;

    $scope.offline = {
        required: {
            'indexeddb': {name: 'IndexedDB', ref: 'http://caniuse.com/#feat=indexeddb'},
            'applicationcache': {name: 'Application Cache', ref: 'http://caniuse.com/#feat=offline-apps'},
            'localstorage': {name: 'Local Storage', ref: 'http://caniuse.com/#feat=namevalue-storage'}
        },
        unsupported: [],
        supported: null
    };

    $scope.check = function(){
        try {
            $scope.offline.supported = 'checking';
            $scope.step = 'checking';
            if (typeof Modernizr !== 'undefined'){
                $log.log('Modernizr is loaded');
                for (var feature in $scope.offline.required){
                    if (!Modernizr[feature]){
                        $scope.offline.unsupported.push(feature);
                    }
                    $log.warn('Unsupported features:', $scope.offline.unsupported);
                }
                $scope.offline.supported = $scope.offline.unsupported.length == 0;
                $log.info('Supported?', $scope.offline.supported ? 'Yes' : 'No');
            } else {
                $scope.offline.supported = false;
                $log.warning('Modernizr was not loaded');
            }
        } catch (e) {
            $scope.offline.supported = 'error'
            $scope.offline.error = e;
            $log.error('Error checking for offline support', e);
        }
        $scope.step = $scope.offline.supported;
    };

    $scope.getBrowser = function(){
        $scope.step = 'get_browser';
    };

    $scope.close = function(){
        $modalInstance.dismiss('cancel');
    }

    $scope.enable = function () {
        $modalInstance.close(true);
    };

});