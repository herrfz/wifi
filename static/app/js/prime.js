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
var myApp = angular.module('primeApp', ['PrimeService']);

/* Controllers */
function Ctrl($scope, Prime) {
    $scope.num = '';
    $scope.value = 'Yo';

    $scope.checkPrime = function () {
        Prime.query({n: $scope.num},
                    function (response) {
                $scope.value = response.return;
            },
                    function () {
                $scope.value = 'thou shalt enter a positive integer';
            });
    };

}

myApp.controller('Ctrl', ['$scope', 'Prime', Ctrl]);


/* Services */
angular.module('PrimeService', ['ngResource']).factory('Prime', function ($resource) {
    var url = '/isprime/:n', actions = {
        query: {method: 'GET'}
    };

    return $resource(url, {}, actions);

});
