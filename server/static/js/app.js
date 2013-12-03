


/**
 * @constructor
 * @param {Object} options Config options.
 */
mf.App = Backbone.Router.extend();


/**
 * @enum {Object}
 */
mf.App.Routes = {
  WEATHER: {
    url: 'weather/:station/:year/:month',
    handler: 'routeWeather_'
  },
  MUSHROOM_OBSERVER: {
    url: 'mob',
    handler: 'routeMob_'
  }
};


/**
 * @param {string} url An url to look for.
 * @return {Object} One of mf.App.Routes or undefined.
 */
mf.App.getRouteByUrl = function(url) {
  var matchingRoute;
  _.each(mf.App.Routes, function(route) {
    if (route.url == url) {
      matchingRoute = route;
    }
  });
  return matchingRoute;
};


/** @inheritDoc */
mf.App.prototype.initialize = function(options) {
  mf.log('mf.App initialize');

  _.each(mf.App.Routes, _.bind(function(route) {
    this.route(route.url, route.handler);
  }, this));

  // We reference window.app so we need it to exist first.
  _.defer(_.bind(function() {
    this.model = new mf.models.App();
    this.view = new mf.views.App({model: this.model});

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
mf.App.prototype.initHistory_ = function() {
  mf.log('mf.App.initHistory_', window.location);

  var usePushState = true;
  var root = '/app/';
  var silent = false;

  mf.log('Backbone.history.start', usePushState, silent);
  var matchedRoute = Backbone.history.start({
    pushState: usePushState,
    root: root,
    silent: silent
  });

  if (!matchedRoute) {
    var url = this.model.weatherPrefs.getUrlState();
    console.warn('No matchedRoute in initHistory, going to', url);
    this.navigate(url, {trigger: true});
  }
};


/**
 * @private
 */
mf.App.prototype.routeWeather_ = function() {
  mf.log('mf.App routeWeather_');
  this.view.transitionPage(mf.App.Routes.WEATHER);
};


/**
 * @private
 */
mf.App.prototype.routeMob_ = function() {
  mf.log('mf.App routeMob_');
  this.view.transitionPage(mf.App.Routes.MUSHROOM_OBSERVER);
};
