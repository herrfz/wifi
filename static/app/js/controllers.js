'use strict';

/* Controllers */
function HomeCtrl($scope, $http, $window, FreeWiFi, Global) {
    
    // map parameters
    if (Global.init==1) { // if application is first loaded
        Global.init = 0;
        Global.uagent = $window.navigator.userAgent;
        
        $http.get('http://ipinfo.io/json').success(function(response) {
            Global.ipaddr = response.ip;
            //console.log(Global.uagent);
        });

        $scope.zoom = Global.zoom;
        $scope.center = {latitude: Global.lat, 
                         longitude: Global.lon};
        var radius = 5000; //TBD
        
    } else {
        $scope.zoom = Global.zoom;
        $scope.center = {latitude: Global.lat, 
                         longitude: Global.lon};
        var radius = 5000; // metres
    }
    
    
    // parameters for the rating widget
    $scope.max = 5;

    
    $scope.hotspots = FreeWiFi.query({lat: $scope.center.latitude,
                                      lon: $scope.center.longitude,
                                      radius: radius},
                                     function(hotspots) {
                                         $scope.markers = hotspots.nearby_hotspots;
                                     });
    
    
    $scope.gotoLocation = function (lat, lon) {
        if ($scope.latitude != lat || $scope.longitude != lon) {
            $scope.zoom = 16;
            $scope.center = { latitude: lat, 
                             longitude: lon };
            Global.lat = lat;
            Global.lon = lon;
            Global.zoom = $scope.zoom;
            
            if (!$scope.$$phase) $scope.$apply("center");
            $scope.hotspots = FreeWiFi.query({lat: $scope.center.latitude, 
                                              lon: $scope.center.longitude, 
                                              radius: radius},
                                             function(hotspots) {
                                                 $scope.markers = hotspots.nearby_hotspots;
                                             });
        }
    };

    // geo-coding
    $scope.search = "";
    $scope.geoCode = function () {
        if ($scope.search && $scope.search.length > 0) {
            if (!this.geocoder) this.geocoder = new google.maps.Geocoder();
            this.geocoder.geocode({ 'address': $scope.search }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var loc = results[0].geometry.location;
                    $scope.search = results[0].formatted_address;
                    $scope.gotoLocation(loc.lat(), loc.lng());

                } else {
                    alert("Sorry, this search produced no results.");
                }
            });
        }
    };
    
    
    $scope.submit = function() {
        Global.lat = $scope.center.latitude;
        Global.lon = $scope.center.longitude;
        Global.zoom = $scope.zoom;
    };

};


function SelectCtrl($scope, $http, $location, HotspotDetail, Global) {
    
    $scope.markers = [];
    $scope.zoom = Global.zoom;
    
    $scope.name = "";
	
	
    // map centre coordinates from home page
    $scope.center = {latitude: Global.lat, 
                    longitude: Global.lon};
    
    // this is a hack
    if ($scope.markers.length==0) {
        $scope.cur_lat = $scope.center.latitude; 
        $scope.cur_lon = $scope.center.longitude;
    } else {
        $scope.cur_lat = $scope.markers[0].latitude; 
        $scope.cur_lon = $scope.markers[0].longitude;
    }
    
    
    $scope.gotoLocation = function (lat, lon) {
        if ($scope.latitude != lat || $scope.longitude != lon) {
            $scope.zoom = 16;
            if (!$scope.$$phase) $scope.$apply(function() {
                $scope.center = { latitude: lat, 
                                  longitude: lon };
                Global.lat = lat;
                Global.lon = lon;
                Global.zoom = $scope.zoom;
								  
                $scope.cur_lat = lat;  //change parameter lat lon after search
                $scope.cur_lon = lon;
            });
        }
    };

    // geo-coding
    $scope.search = "";
    $scope.geoCode = function () {
        if ($scope.search && $scope.search.length > 0) {
            if (!this.geocoder) this.geocoder = new google.maps.Geocoder();
            this.geocoder.geocode({ 'address': $scope.search }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var loc = results[0].geometry.location;
                    $scope.search = results[0].formatted_address;
                    $scope.gotoLocation(loc.lat(), loc.lng());
					$scope.lokasi();
					
                } else {
                    alert("Sorry, this search produced no results.");
                }
            });
        }
    };
    
	// foursquare API
	$scope.lokasi = function(){
 	var locurl = "https://api.foursquare.com/v2/venues/search?" +
        "ll=" + $scope.cur_lat + "," + $scope.cur_lon + 
        "&v=20131010" +
        "&client_id=FKVZUNMDCVVUHV32XUJ1AII35CWBPZKQTG1V0UBXSMLXOLUJ" + 
        "&client_secret=MLM4GTR22DS0JKNBZTSQWPBJ1JCBSG4IPBVZHFTBUOMR3RIB";
    $http.get(locurl).success(function(data) {
        $scope.resp = data;
        $scope.places = [];
        var venues = $scope.resp.response.venues;
        var n_places = 10; // limit the places to 10; warning, not sorted by checkins!
        if (venues.length < n_places) {
            n_places = venues.length;
        }
        
        // really? JavaScript?
        for (var i=0; i< n_places; i++){
            if (venues[i].stats.checkinsCount > 5) { // show only those with >5 checkins
                $scope.places.push({"name": venues[i].name, 
                                    "lat": venues[i].location.lat, 
                                    "lon": venues[i].location.lng});
            }
 
        }
        
        // initiate the new_hotspot, actual value to be set in submit() via radio button
        $scope.selected = {place: {name: "None",
                                   lat: 0,
                                   lon: 0}};

    });
   
	};
	//init 4square API
	 $scope.lokasi();
	 
    
    $scope.submit = function(venue_source) {
        if (venue_source=='radio') {
            var name = $scope.selected.place.name;
            Global.lat = $scope.selected.place.lat;
            Global.lon = $scope.selected.place.lon;
            Global.zoom = $scope.zoom;
            
            // add hotspot using HotspotDetail service query
            var new_hotspot = {name: name,
                               latitude: $scope.selected.place.lat,
                               longitude: $scope.selected.place.lon};
            HotspotDetail.create(new_hotspot, function(resp){
                $scope.response = resp.hotspot.uri;
            });
            alert("Hotspot telah ditambahkan, terima kasih!");
            $location.path('/home');
            
        } else if (venue_source=='marker') {
            Global.lat = $scope.markers[0].latitude;
            Global.lon = $scope.markers[0].longitude;
            Global.zoom = $scope.zoom;
            
            var new_hotspot = {name: $scope.name,
                               latitude: $scope.markers[0].latitude,
                               longitude: $scope.markers[0].longitude};
            HotspotDetail.create(new_hotspot, function(resp){
                $scope.response = resp.hotspot.uri;
            });
            alert("Hotspot telah ditambahkan, terima kasih!");
            $location.path('/home');
        }
    };


};


function DetailsCtrl($scope, $routeParams, $location, $window, HotspotDetail, Global) {
    
    // don't simply use $routeParams.id; 
    // something's not right with angular-disqus' setting of window.disqus_identifier
    $scope.id = $location.absUrl();  
    // center and zoom just need to be initialized
    // the actual value will be updated after the query
    $scope.center = {latitude: 0, 
                    longitude: 0};
    $scope.zoom = 16;
    
    // parameters for the rating widget
    $scope.max = 5;
    
    $scope.hotspot = HotspotDetail.query({id: $routeParams.id}, 
                                         function(hotspot){
                                             $scope.name = hotspot.hotspot.name;
                                             $scope.lat = hotspot.hotspot.latitude;
                                             $scope.lon = hotspot.hotspot.longitude;
                                             $scope.center = { latitude: $scope.lat, 
                                                               longitude: $scope.lon };
											 $scope.markers = [$scope.center]
                                             Global.lat = $scope.lat;
                                             Global.lon = $scope.lon;
                                             Global.zoom = $scope.zoom;
                                         });
    
    //console.log(window.disqus_identifier);
    //console.log($window.navigator.userAgent);
    
};





myApp.controller('HomeCtrl', ['$scope', '$http', '$window', 'FreeWiFi', 'Global', HomeCtrl]);
myApp.controller('SelectCtrl', ['$scope', '$http', '$location', 'HotspotDetail', 'Global', SelectCtrl]);
myApp.controller('DetailsCtrl', ['$scope', '$routeParams', '$location', '$window', 'HotspotDetail', 'Global', DetailsCtrl]);