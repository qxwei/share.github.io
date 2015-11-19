
var MetronicApp = angular.module("MetronicApp", ["ui.router",  "oc.lazyLoad", "ngSanitize"]); 

MetronicApp.config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({/*global configs go here*/});
}]);

//AngularJS v1.3.x workaround for old style controller declarition in HTML
//MetronicApp.config(['$controllerProvider', function($controllerProvider) {
//  // this option might be handy for migrating old apps, but please don't use it
//  // in new ones!
//  $controllerProvider.allowGlobals();
//}]);

/* Setup global settings */
MetronicApp.factory('settings', ['$rootScope', function($rootScope) {
    // supported languages
    var settings = {
        layout: {
            pageSidebarClosed: false, // sidebar state
            pageAutoScrollOnLoad: 1000 // auto scroll to top on page load
        }
    };

    $rootScope.settings = settings;

    return settings;
}]);

MetronicApp.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
	//defaut URL
    $urlRouterProvider.otherwise("/hall");
    $stateProvider
    .state('hall', {
        url: "/hall",
        views: {
            '': {
                templateUrl: 'views/hall.html',
                controller: 'HallController',
            }
        },       
        data: {pageTitle: '聊吧'},
        resolve: {
            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load({
                    name: 'MetronicApp',
                    insertBefore: '#ng_load_plugins_before', 
                    files: [
                        'https://qxwei.github.io/chat123/resources/css/dashboard.css',  
//                       './resources/scripts/lib/jquery.qqFace.js',
                        'https://qxwei.github.io/chat123/resources/scripts/lib/sockjs-0.3.4.js',
                        'https://qxwei.github.io/chat123/resources/scripts/lib/stomp.min.js',
                        'https://qxwei.github.io/chat123/resources/scripts/chat.js',
                        'https://qxwei.github.io/chat123/resources/scripts/commonModel.js',
                        'https://qxwei.github.io/chat123/resources/scripts/lib/jquery.qqFace.js',
                        'https://qxwei.github.io/chat123/resources/scripts/app/controllers/HallController.js'
                    ] 
                });
            }]
        }
    })
}]);

/* Init global settings and run the app */
MetronicApp.run(["$rootScope", "settings", "$state", function($rootScope, settings, $state) {
    $rootScope.$state = $state; // state to be accessed from view
}]);