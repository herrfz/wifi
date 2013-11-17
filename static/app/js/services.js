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

myApp.factory('Global', function() {
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


myApp.factory('Cookie', function() {
    function fetchValue(name) {
        var aCookie = document.cookie.split("; ");
	    for (var i=0; i < aCookie.length; i++)
	    {
	        // a name/value pair (a crumb) is separated by an equal sign
	        var aCrumb = aCookie[i].split("=");
	        if (name === aCrumb[0])
	        {
                var value = '';
                try {
                    value = angular.fromJson(aCrumb[1]);
                } catch(e) {
	                value = unescape(aCrumb[1]);
                }
                return value;
	        }
	    }
	    // a cookie with the requested name does not exist
	    return null;
    }
    return function(name, options) {
        // get cookie
        if(arguments.length === 1) return fetchValue(name);
        
        // set cookie
        var cookie = name + '=';
        if(typeof options === 'object') {
            var expires = '';
            cookie += (typeof options.value === 'object') ? angular.toJson(options.value) + ';' : options.value + ';';
            if(options.expires) {
                var date = new Date();
                date.setTime( date.getTime() + (options.expires * 24 *60 * 60 * 1000));
			    expires = date.toGMTString();
            }
            cookie += (!options.session) ? 'expires=' + expires + ';' : '';
            cookie += (options.path) ? 'path=' + options.path + ';' : '';
            cookie += (options.secure) ? 'secure;' : '';
        } else {
            cookie += options + ';';
        }
         document.cookie = cookie;
    }
});