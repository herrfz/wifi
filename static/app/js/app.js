'use strict';

/* App Module */
var myApp = angular.module('freeWifiFinderApp', ['google-maps', 'freeWiFiServices']).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/home/:lat/:lon', {templateUrl: 'static/app/partials/home.html',   controller: 'HomeCtrl'}).
    when('/select/:lat/:lon/:zoom', {templateUrl: 'static/app/partials/select.html',   controller: 'SelectCtrl'}).
    when('/addnew/:lat/:lon', {templateUrl: 'static/app/partials/addnew.html',   controller: 'AddNewCtrl'}).
    when('/thanks', {templateUrl: 'static/app/partials/thanks.html',   controller: 'ThanksCtrl'}).
    when('/:id/details', {templateUrl: 'static/app/partials/details.html',   controller: 'DetailsCtrl'}).
    otherwise({redirectTo: '/home/-6.908361/107.610698'});
}]);

myApp.config(function($httpProvider){
    $httpProvider.defaults.useXDomain = true; // attempted for Flask-Angular web server integration
    delete $httpProvider.defaults.headers.common['X-Requested-With']; // used in 4sq API call
});
