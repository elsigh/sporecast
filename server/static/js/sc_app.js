

/**
 * @type {Object}
 */
var sc = {};


/**
 * @constructor
 * @param {Object} options Config options.
 */
sc.App = Backbone.Router.extend();


/**
 * @enum {Object}
 */
sc.App.Routes = {
  WEATHER: {
    url: 'weather/:station/:year/:month',
    handler: 'routeWeather_'
  },
  MUSHROOM_OBSERVER: {
    url: 'mob',
    handler: 'routeMob_'
  },
  PHOTOS: {
    url: 'photos',
    handler: 'routePhotos_'
  }
};


/**
 * @param {string} url An url to look for.
 * @return {Object} One of sc.App.Routes or undefined.
 */
sc.App.getRouteByUrl = function(url) {
  var matchingRoute;
  _.each(sc.App.Routes, function(route) {
    if (route.url == url) {
      matchingRoute = route;
    }
  });
  return matchingRoute;
};


/** @inheritDoc */
sc.App.prototype.initialize = function(options) {
  bone.log('sc.App initialize');

  _.each(sc.App.Routes, _.bind(function(route) {
    this.route(route.url, route.handler);
  }, this));

  // We reference window.app so we need it to exist first.
  _.defer(_.bind(function() {
    this.model = new sc.models.App();
    this.view = new sc.views.App({model: this.model});

    _.defer(_.bind(function() {
      this.initHistory_();
      window.navigator.splashscreen &&
          _.delay(window.navigator.splashscreen.hide, 100);
    }, this));
  }, this));

};


/**
 * Initializes Backbone.history in our app.
 * @private
 */
sc.App.prototype.initHistory_ = function() {
  bone.log('sc.App.initHistory_', window.location);

  var usePushState = true;
  var root = '/app/';
  var silent = false;

  bone.log('Backbone.history.start', usePushState, silent);
  var matchedRoute = Backbone.history.start({
    pushState: usePushState,
    root: root,
    silent: silent
  });

  if (!matchedRoute) {
    var url = this.model.weatherData.prefs.getUrlState();
    console.warn('No matchedRoute in initHistory, going to', url);
    this.navigate(url, {trigger: true});
  }
};


/**
 * @private
 */
sc.App.prototype.routeWeather_ = function() {
  bone.log('sc.App routeWeather_');
  this.view.transitionPage(sc.App.Routes.WEATHER);
};


/**
 * @private
 */
sc.App.prototype.routeMob_ = function() {
  bone.log('sc.App routeMob_');
  this.view.transitionPage(sc.App.Routes.MUSHROOM_OBSERVER);
};


/**
 * @private
 */
sc.App.prototype.routePhotos_ = function() {
  bone.log('sc.App routePhotos_');
  this.view.transitionPage(sc.App.Routes.PHOTOS);
};
