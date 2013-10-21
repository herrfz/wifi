'use strict';

/* Services */

angular.module('freeWiFiServices', ['ngResource']).
    factory('FreeWiFi', function($resource){
        var url = '/freewifi/api/v1.0/hotspots/:lat/:lon/:radius';
        var params = {
            host: "localhost",
            port: 5000
        }
        var actions = {
            query: {method: 'GET'}
        }
        
        return $resource(url, {}, actions);
    
}).factory('HotspotDetail', function($resource){
        var url = '/freewifi/api/v1.0/hotspots/:id';
        var actions = {
            query: {method: 'GET'},
            create: {method: 'POST'},
            update: {method: 'PUT'},
            del: {method: 'DELETE'}
        }
        
        return $resource(url, {}, actions);
    
});