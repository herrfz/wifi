/*!
 *
 * Copyright 2015, Eriza Fazli <erizzaaaaa@gmail.com> 
 * Licensed under the GPL Version 3 license.
 * https://github.com/herrfz/wifi/LICENSE
 *
 */
/*global angular */
'use strict';

/* Directives */

angular.module('freeWifiFinderApp').directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});
