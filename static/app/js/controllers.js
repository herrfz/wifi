'use strict';

/* Controllers */
function HomeCtrl($scope, $routeParams, FreeWiFi) {
    $scope.test = "home";
    
    $scope.zoom = 12;
    var radius = 5000; // metres
    
    // hard-coded default map centre coordinate and initial hotspots in the surrounding
    $scope.center = { latitude: $routeParams.lat, 
                      longitude: $routeParams.lon };
    $scope.hotspots = FreeWiFi.query({lat: $scope.center.latitude,
                                      lon: $scope.center.longitude,
                                      radius: radius},
                                     function(hotspots) {
                                         $scope.markers = hotspots.nearby_hotspots;
                                     });
    
    
    $scope.gotoLocation = function (lat, lon) {
        if ($scope.latitude != lat || $scope.longitude != lon) {
            $scope.zoom = 16;
            $scope.center = { latitude: lat, longitude: lon };
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

};


function SelectCtrl($scope, $http, $routeParams) {
    $scope.test = "confirm";
    
    $scope.markers = [];
    $scope.zoom = parseInt($routeParams.zoom);
    
    // map centre coordinates from home page
    $scope.center = { latitude: $routeParams.lat, 
                      longitude: $routeParams.lon };
    
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
                $scope.cur_lat = $scope.markers[0].latitude;
                $scope.cur_lon = $scope.markers[0].longitude;
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
    });

};


function AddNewCtrl($scope, $routeParams, HotspotDetail) {
    $scope.test = "addnew";
    
    $scope.name = "";
    $scope.lat = $routeParams.lat;
    $scope.lon = $routeParams.lon;
    
    $scope.addNew =  function(name) {
        var new_venue = {name: $scope.name,
                         latitude: $scope.lat,
                         longitude: $scope.lon};
        HotspotDetail.create(new_venue,
                             function(resp){
                                 $scope.response = resp.hotspot.uri;
                             });
    } 
    
    //console.log($scope.name);

};


function ThanksCtrl($scope) {
  $scope.test = "thanks";

};


function DetailsCtrl($scope, $routeParams, HotspotDetail) {
    $scope.test = "details";
    
    $scope.id = $routeParams.id;
    $scope.hotspot = HotspotDetail.query({id: $scope.id}, 
                                         function(hotspot){
                                             $scope.name = hotspot.hotspot.name;
                                             $scope.lat = hotspot.hotspot.latitude;
                                             $scope.lon = hotspot.hotspot.longitude;
                                         });

};



myApp.controller('HomeCtrl', ['$scope', '$routeParams', 'FreeWiFi', HomeCtrl]);
myApp.controller('SelectCtrl', ['$scope', '$http', '$routeParams', SelectCtrl]);
myApp.controller('AddNewCtrl', ['$scope', '$routeParams', 'HotspotDetail', AddNewCtrl]);
myApp.controller('ThanksCtrl', ['$scope', ThanksCtrl]);
myApp.controller('DetailsCtrl', ['$scope', '$routeParams', 'HotspotDetail', DetailsCtrl]);