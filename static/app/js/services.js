/*!
 *
 * Copyright 2015, Eriza Fazli <erizzaaaaa@gmail.com> 
 * Licensed under the GPL Version 3 license.
 * https://github.com/herrfz/LICENSE
 *
 */
'use strict';

/* Services */

angular.module('GeoService', ['ngResource']).factory('FreeWiFi', function ($resource) {
    var url = '/freewifi/api/v1.0/hotspots/:lat/:lon/:radius';
    var actions = {
        query: {method: 'GET'}
    };
        
    return $resource(url, {}, actions);
    
});


angular.module('HotspotService', ['ngResource']).factory('HotspotDetail', function ($resource) {
    var url = '/freewifi/api/v1.0/hotspots/:id';
    var actions = {
        query: {method: 'GET'},
        create: {method: 'POST'},
        update: {method: 'PUT'},
        del: {method: 'DELETE'}
    };
        
    return $resource(url, {}, actions);
    
});


angular.module('RatingService', ['ngResource']).factory('HotspotRating', function ($resource) {
    var url = '/freewifi/api/v1.0/rating/:id/:ip/:date';
    var actions = {
        query: {method: 'GET'},
        create: {method: 'POST'},
        update: {method: 'PUT'}
    };
    
    return $resource(url, {}, actions);
});


myApp.factory('Global', function () {
    return {
        // init to non-zero small value to avoid 4sq API bad request response error
        // which occurs if (lat, lon) = (0, 0)
        lat: 0.01,
        lon: 0.01,
        // full world view
        zoom: 1,
        // flag marking first application load
        init: 1,
        // user identifications
        ipaddr: ''
    };
});
