/*!
 *
 * Copyright 2015, Eriza Fazli <erizzaaaaa@gmail.com> 
 * Licensed under the GPL Version 3 license.
 * https://github.com/herrfz/wifi/LICENSE
 *
 */
/*global google */
/*global alert */
/*global myApp */
/*jslint todo: true */
'use strict';

/* Controllers */
function HomeCtrl($scope, $http, FreeWiFi, Global) {

    // map parameters
    if (Global.init === 1) { // if application is first loaded
        Global.init = 0;

        $http.jsonp('http://www.codehelper.io/api/ips/?callback=JSON_CALLBACK').success(function (response) {
            Global.ipaddr = response.IP;
        });

        $scope.zoom = Global.zoom;
        $scope.center = {latitude: Global.lat,
                         longitude: Global.lon};

    } else {
        $scope.zoom = Global.zoom;
        $scope.center = {latitude: Global.lat,
                         longitude: Global.lon};
    }

    var radius = 5000; // TODO: set a value for a better presentation on first load

    // parameters for the rating widget
    $scope.max = 5;

    $scope.hotspots = FreeWiFi.query({lat: $scope.center.latitude,
                                      lon: $scope.center.longitude,
                                      radius: radius},
                                     function (hotspots) {
            $scope.markers = hotspots.nearby_hotspots;
        });


    $scope.gotoLocation = function (lat, lon) {
        if ($scope.latitude !== lat || $scope.longitude !== lon) {
            $scope.zoom = 16;
            $scope.center = { latitude: lat,
                             longitude: lon };
            Global.lat = lat;
            Global.lon = lon;
            Global.zoom = $scope.zoom;

            if (!$scope.$$phase) { $scope.$apply("center"); }
            $scope.hotspots = FreeWiFi.query({lat: $scope.center.latitude,
                                              lon: $scope.center.longitude,
                                              radius: radius},
                                             function (hotspots) {
                    $scope.markers = hotspots.nearby_hotspots;
                });
        }
    };

    // geo-coding
    $scope.search = "";
    $scope.geoCode = function () {
        if ($scope.search && $scope.search.length > 0) {
            if (!this.geocoder) { this.geocoder = new google.maps.Geocoder(); }
            this.geocoder.geocode({ 'address': $scope.search }, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    var loc = results[0].geometry.location;
                    $scope.search = results[0].formatted_address;
                    $scope.gotoLocation(loc.lat(), loc.lng());

                } else {
                    alert("Sorry, this search produced no results.");
                }
            });
        }
    };


    $scope.submit = function () {
        Global.lat = $scope.center.latitude;
        Global.lon = $scope.center.longitude;
        Global.zoom = $scope.zoom;
    };

}


function SelectCtrl($scope, $http, $location, HotspotDetail, Global) {

    $scope.markers = [];
    $scope.zoom = Global.zoom;

    $scope.name = "";


    // map centre coordinates from home page
    $scope.center = {latitude: Global.lat,
                     longitude: Global.lon};

    // this is a hack
    if ($scope.markers.length === 0) {
        $scope.cur_lat = $scope.center.latitude;
        $scope.cur_lon = $scope.center.longitude;
    } else {
        $scope.cur_lat = $scope.markers[0].latitude;
        $scope.cur_lon = $scope.markers[0].longitude;
    }


    $scope.gotoLocation = function (lat, lon) {
        if ($scope.latitude !== lat || $scope.longitude !== lon) {
            $scope.zoom = 16;
            if (!$scope.$$phase) { $scope.$apply(function () {
                $scope.center = { latitude: lat,
                                  longitude: lon };
                Global.lat = lat;
                Global.lon = lon;
                Global.zoom = $scope.zoom;

                $scope.cur_lat = lat;  //change parameter lat lon after search
                $scope.cur_lon = lon;
            }); }
        }
    };

    // geo-coding
    $scope.search = "";
    $scope.geoCode = function () {
        if ($scope.search && $scope.search.length > 0) {
            if (!this.geocoder) { this.geocoder = new google.maps.Geocoder(); }
            this.geocoder.geocode({ 'address': $scope.search }, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
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
    var i;
    $scope.lokasi = function () {
        var locurl = "https://api.foursquare.com/v2/venues/search?" +
                "ll=" + $scope.cur_lat + "," + $scope.cur_lon +
                "&v=20131010" +
                "&client_id=FKVZUNMDCVVUHV32XUJ1AII35CWBPZKQTG1V0UBXSMLXOLUJ" +
                "&client_secret=MLM4GTR22DS0JKNBZTSQWPBJ1JCBSG4IPBVZHFTBUOMR3RIB";
        $http.get(locurl).success(function (data) {
            $scope.resp = data;
            $scope.places = [];
            var venues = $scope.resp.response.venues, n_places = 10; // limit the places to 10; warning, not sorted by checkins!
            if (venues.length < n_places) {
                n_places = venues.length;
            }

            // really? JavaScript?
            for (i = 0; i < n_places; i += 1) {
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


    $scope.submit = function (venue_source) {
        var name, new_hotspot;
        if (venue_source === 'radio') {
            name = $scope.selected.place.name;
            Global.lat = $scope.selected.place.lat;
            Global.lon = $scope.selected.place.lon;
            Global.zoom = $scope.zoom;

            // add hotspot using HotspotDetail service query
            new_hotspot = {name: name,
                           latitude: $scope.selected.place.lat,
                           longitude: $scope.selected.place.lon};
            HotspotDetail.create(new_hotspot, function (resp) {
                $scope.response = resp.hotspot.uri;
            });
            alert("Hotspot telah ditambahkan, terima kasih!");
            $location.path('/home');

        } else if (venue_source === 'marker') {
            Global.lat = $scope.markers[0].latitude;
            Global.lon = $scope.markers[0].longitude;
            Global.zoom = $scope.zoom;

            new_hotspot = {name: $scope.name,
                           latitude: $scope.markers[0].latitude,
                           longitude: $scope.markers[0].longitude};
            HotspotDetail.create(new_hotspot, function (resp) {
                $scope.response = resp.hotspot.uri;
            });
            alert("Hotspot telah ditambahkan, terima kasih!");
            $location.path('/home');
        }
    };
}


function DetailsCtrl($scope, $routeParams, $location, $http, HotspotDetail, HotspotRating, Global) {

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
    $scope.rating = 0;
    $scope.ratingChanged = false;

    // methods to detect if rating has been modified
    $scope.hoveringOver = function (x) {
        $scope.overStar = x;
    };

    $scope.hoveringLeave = function (x) {
        $scope.leaveStar = x;
        if ($scope.overStar === $scope.leaveStar) {
            $scope.ratingChanged = true;
        }
    };


    // state variables for button controls
    var action = '',
        pressed = '',
        enabled = false,
        // prepare date variables
        dateobj = new Date(),
        date = dateobj.getUTCDate(),
        month = dateobj.getUTCMonth() + 1,
        year = dateobj.getUTCFullYear(),
        yymmdd = year + '-' + month + '-' + date;

    $scope.hotspot = HotspotDetail.query({id: $routeParams.id},
                                         function (hotspot) {
            $scope.name = hotspot.hotspot.name;
            $scope.lat = hotspot.hotspot.latitude;
            $scope.lon = hotspot.hotspot.longitude;
            $scope.center = {latitude: $scope.lat,
                             longitude: $scope.lon};
            $scope.markers = [$scope.center];
            Global.lat = $scope.lat;
            Global.lon = $scope.lon;
            Global.zoom = $scope.zoom;
        });

    // get ip address, don't assume that it's already set through home page 
    $http.jsonp('http://www.codehelper.io/api/ips/?callback=JSON_CALLBACK').success(function (response) {
        Global.ipaddr = response.IP;
        var rating_record = {id: $routeParams.id,
                             ip: Global.ipaddr,
                             date: yymmdd},
            // get rating, likes, unlikes for current hotspot; ip address and date identify unique user
            dbrating = HotspotRating.query(rating_record, function (resp) {
                if (resp.result.rating === -1) {
                    // $scope.rating is not set here, 
                    // the number of stars signifies the rating __provided__ by the user
                    // not the average rating of the hotspot
                    action = 'insert';
                    // likes/unlikes have a different semantic; 
                    // the number shows the total likes/unlikes of the hotspot
                    $scope.hotspot_likes = parseInt(resp.result.hotspot_likes, 10);
                    $scope.hotspot_unlikes = parseInt(resp.result.hotspot_unlikes, 10);
                    $scope.likes = 0;
                    $scope.unlikes = 0;
                } else {
                    action = 'update';
                    $scope.rating = parseInt(resp.result.rating, 10);
                    if (resp.result.likes === '1' && resp.result.unlikes === '0') {
                        pressed = 'like';
                        enabled = true;
                        $scope.hotspot_likes = parseInt(resp.result.hotspot_likes, 10) - 1;
                        $scope.hotspot_unlikes = parseInt(resp.result.hotspot_unlikes, 10);
                        $scope.likes = 1;
                        $scope.unlikes = 0;
                    } else if (resp.result.likes === '0' && resp.result.unlikes === '1') {
                        pressed = 'unlike';
                        enabled = true;
                        $scope.hotspot_likes = parseInt(resp.result.hotspot_likes, 10);
                        $scope.hotspot_unlikes = parseInt(resp.result.hotspot_unlikes, 10) - 1;
                        $scope.likes = 0;
                        $scope.unlikes = 1;
                    } else {
                        $scope.hotspot_likes = parseInt(resp.result.hotspot_likes, 10);
                        $scope.hotspot_unlikes = parseInt(resp.result.hotspot_unlikes, 10);
                        $scope.likes = 0;
                        $scope.unlikes = 0;
                    }
                }
            });
        console.log(dbrating); // TODO: just to trick jslint
    });


    $scope.updateLike = function () {
        if (pressed === '' && enabled === false) {
            pressed = 'like';
            enabled = true;
            $scope.likes += 1;
        } else if (pressed === 'like' && enabled === true) {
            pressed = 'like';
            enabled = false;
            $scope.likes -= 1;
        } else if (pressed === 'like' && enabled === false) {
            pressed = 'like';
            enabled = true;
            $scope.likes += 1;
        } else if (pressed === 'unlike' && enabled === false) {
            pressed = 'like';
            enabled = true;
            $scope.likes += 1;
        } else if (pressed === 'unlike' && enabled === true) {
            pressed = 'like';
            enabled = true;
            $scope.likes += 1;
            $scope.unlikes -= 1;
        }
    };

    $scope.updateUnlike = function () {
        if (pressed === '' && enabled === false) {
            pressed = 'unlike';
            enabled = true;
            $scope.unlikes += 1;
        } else if (pressed === 'unlike' && enabled === true) {
            pressed = 'unlike';
            enabled = false;
            $scope.unlikes -= 1;
        } else if (pressed === 'unlike' && enabled === false) {
            pressed = 'unlike';
            enabled = true;
            $scope.unlikes += 1;
        } else if (pressed === 'like' && enabled === false) {
            pressed = 'unlike';
            enabled = true;
            $scope.unlikes += 1;
        } else if (pressed === 'like' && enabled === true) {
            pressed = 'unlike';
            enabled = true;
            $scope.likes -= 1;
            $scope.unlikes += 1;
        }
    };

    $scope.$on('$locationChangeStart', function () {
        var rating_record = {id: $routeParams.id,
                             ip: Global.ipaddr,
                             date: yymmdd,
                             rating: $scope.rating,
                             likes: $scope.likes,
                             unlikes: $scope.unlikes};
        if (action === 'insert' && ($scope.ratingChanged === true || pressed !== '')) {
            HotspotRating.create(rating_record, function (resp) {
                $scope.response = resp;
            });
        } else if (action === 'update' && ($scope.ratingChanged === true || pressed !== '')) {
            HotspotRating.update(rating_record, function (resp) {
                $scope.response = resp;
            });
        }
    });

    //console.log(window.disqus_identifier);

}


myApp.controller('HomeCtrl', ['$scope', '$http', 'FreeWiFi', 'Global', HomeCtrl]);
myApp.controller('SelectCtrl', ['$scope', '$http', '$location', 'HotspotDetail', 'Global', SelectCtrl]);
myApp.controller('DetailsCtrl', ['$scope', '$routeParams', '$location', '$http', 'HotspotDetail', 'HotspotRating', 'Global', DetailsCtrl]);
