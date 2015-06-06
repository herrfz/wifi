WiFinder webapp
===============

#### Web application:

* [AngularJS 1.0.6](http://code.angularjs.org/1.0.6/)
	* [Directives for Google Maps](http://nlaplante.github.io/angular-google-maps/#!/usage); [issues with marker click](https://github.com/nlaplante/angular-google-maps/issues/85)
* [Bootstrap 2](http://www.onextrapixel.com/2012/11/12/how-to-use-twitter-bootstrap-to-create-a-responsive-website-design/)
* [Bootstrap Angular-UI 0.6.0](http://angular-ui.github.io/bootstrap/)
* Google Maps API
	* [Geocode and search](http://jsfiddle.net/Wijmo/Rqcsj/)
* [Foursquare API](https://developer.foursquare.com/start)
	* [Python API](https://github.com/mLewisLogic/foursquare) for trying out in IPython notebook 


#### TODO:

- Decide to include detailed info or not (need additional form)
- Features:
	- ~~Checkin, Upvote, Downvote, Scoring logic~~
	  - how to manage the session? e.g. a user is allowed to vote only once <-- current implementation: one rate/like/unlike is allowed per hotspot by one IP address on a particular date.
	- ~~Comment via Disqus~~
	- Dynamic venue recommendations based on map centre
- ~~Sanitize input form (character "'" is currently not accepted)~~

