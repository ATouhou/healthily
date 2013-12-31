var app = angular.module('healthily', ['ui.bootstrap', 'ngAnimate', 'angularMoment', 'btford.markdown']);

// app.config(function($rootScopeProvider){

// });

app.run(function($rootScope, FoodService, $modal){
    $rootScope.loading = true;
    FoodService.storeNutrients().success(function(){
        $rootScope.$broadcast('appReady');
        $rootScope.loading = false;
    });

    $rootScope.showOfflineDialog = function(){
        var offlineModal = $modal.open({
            templateUrl: 'partials/offline.html',
            controller: 'offlineController'
        });
    };

    // 

    // Modernizr.load({
    //   test: Modernizr.indexeddb,
    //   yep : 'db.js/index.js',
    //   nope: function(){
    //     alert('IndexedDB not supported!');
    //   }
    // });
});