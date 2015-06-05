/*!
 *
 * Copyright 2015, Eriza Fazli <erizzaaaaa@gmail.com> 
 * Licensed under the GPL Version 3 license.
 * https://github.com/herrfz/wifi/LICENSE
 *
 */
/*global angular */
'use strict';

/* App Module */
var myApp = angular.module('freeWifiFinderApp', ['google-maps',
                                                 'GeoService',
                                                 'HotspotService',
                                                 'RatingService',
                                                 'ui.bootstrap',
                                                 'ngDisqus']);


myApp.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
        when('/home', {templateUrl: 'static/app/partials/home.html',   controller: 'HomeCtrl'}).
        when('/select', {templateUrl: 'static/app/partials/select.html',   controller: 'SelectCtrl'}).
        when('/addnew', {templateUrl: 'static/app/partials/addnew.html',   controller: 'AddNewCtrl'}).
        when('/thanks', {templateUrl: 'static/app/partials/thanks.html',   controller: 'ThanksCtrl'}).
        when('/:id/details', {templateUrl: 'static/app/partials/details.html',   controller: 'DetailsCtrl'}).
        otherwise({redirectTo: '/home'});
}]);


myApp.config(function ($httpProvider, $disqusProvider, $locationProvider) {
    $httpProvider.defaults.useXDomain = true; // attempted for Flask-Angular web server integration
    delete $httpProvider.defaults.headers.common['X-Requested-With']; // used in 4sq API call
    $disqusProvider.setShortname('wifinder');
    $locationProvider.hashPrefix('!');
});
