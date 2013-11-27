


/**
 * @extends {Backbone.View}
 * @constructor
 */
mf.views.App = Backbone.View.extend({
  el: '.mf-app',
  events: {
    'tap .mf-app-link': 'onClickAppLink_'
  }
});


/** @inheritDoc */
mf.views.App.prototype.initialize = function(options) {
  mf.log('mf.views.App.initialize', this.model);

  // For some special scroll/overflow control.
  $('html,body').addClass('mf-app-container');

  $('body').addClass('mf-platform-' + mf.ua.getPlatform());

  $(window).on('orientationchange',
      _.debounce(_.bind(this.handleResizeOrientationChange_, this), 500), true);
  $(window).on('resize',
      _.debounce(_.bind(this.handleResizeOrientationChange_, this), 500), true);
};


/**
 * @param {Event} e A click event.
 * @private
 */
mf.views.App.prototype.onClickAppLink_ = function(e) {
  mf.log('mf.views.App.onClickAppLink_', e);
  e.preventDefault();
  window['app'].navigate($(e.currentTarget).attr('href'),
                         {trigger: true});
};


/**
 * @private
 */
mf.views.App.prototype.handleResizeOrientationChange_ = function() {
  this.setCurrentView(this.currentView);
};


/**
 * @param {Backbone.View} view A view instance.
 * @return {number} The index of this node in it's parent list.
 * @private
 */
mf.views.App.prototype.getTabIndex_ = function(view) {
  return view.$el.parent('.mf-tab').index();
};


/**
 * @param {Backbone.View} view A view instance.
 */
mf.views.App.prototype.setCurrentView = function(view) {
  // Calls a "setIsActive" function if defined on this view.
  if (this.currentView && view !== this.currentView) {
    this.currentView.setIsActive &&
        this.currentView.setIsActive(false);
  }

  this.currentView = view;

  // Calls a "setIsActive" function if defined on this view.
  this.currentView.setIsActive &&
      this.currentView.setIsActive(true);

  // Sets up tab / container widths so we can have nice scrolling and
  // tab animations.
  var screenW = document.documentElement.clientWidth;

  var $mfTabs = $('.mf-tab');
  //$('.mf-tab-frame').css('width', $mfTabs.length * screenW + 'px');

  //$mfTabs.each(function(i, el) {
  //  $(el).css('left', i * screenW + 'px').css('width', screenW + 'px');
  //});

  var tabIndex = this.getTabIndex_(view);
  var transform = 'translateX(-' + (tabIndex * screenW) + 'px)';
  $('.mf-tab-frame').
      css('-webkit-transform', transform).
      css('transform', transform);

  _.defer(function() {
    // Enables transitions on all but the first change.
    if (!$('.mf-tab-frame').hasClass('mf-active')) {
      $('.mf-tab-frame').addClass('mf-active');
    }
  });
};


/**
 * @param {Object} route A route.
 */
mf.views.App.prototype.transitionPage = function(route) {
  mf.log('mf.views.App --> transitionPage', route);

  var newTab;
  var newView;

  this.$('.mf-tabs .selected').removeClass('selected');
  var $priorActiveTab = this.$('.mf-tab.mf-active');
  if ($priorActiveTab.length) {
    $priorActiveTab.removeClass('mf-active');
    _.defer(function() {
      $priorActiveTab.get(0).scrollTop = 0;
    });
  }

  if (_.isEqual(mf.App.Routes.WEATHER, route)) {
    if (!this.viewWeather) {
      this.viewWeather = new mf.views.Weather({
        prefs: this.model.weatherPrefs,
        model: this.model.weatherData
      });
      this.viewWeather.render();
    }
    newTab = 'weather';
    newView = this.viewWeather;

  } else if (_.isEqual(mf.App.Routes.MUSHROOM_OBSERVER, route)) {
    /*
    if (!this.viewMushroomObserver) {
      this.viewMushroomObserver = new mf.views.Following({
        model: this.model.user.get('following'),
        user: this.model.user
      });
      this.viewFollowing.render();
    }
    newTab = 'mushroom-observer';
    newView = this.viewFollowing;
    */

  }

  this.$('.mf-tabs .' + newTab).addClass('selected');
  this.$('.mf-tab.mf-tab-' + newTab).addClass('mf-active');
  this.setCurrentView(newView);
};


/******************************************************************************/



/**
 * @extends {Backbone.View}
 * @constructor
 */
mf.views.Weather = Backbone.View.extend({
  el: '.mf-weather',
  events: {
    'change select': 'onChangePrefs_'
  }
});


/** @inheritDoc */
mf.views.Weather.prototype.initialize = function(options) {
  mf.log('views.Weather initialize');
  this.prefs = options.prefs;
  this.subView = new mf.views.WeatherData({
    model: this.model
  });
};


/** @private */
mf.views.Weather.prototype.onChangePrefs_ = function() {
  var obj = mf.views.serializeFormToObject(this.$form);
  mf.log('onChangePrefs_', obj);
  this.prefs.set(obj);
};


/** @inheritDoc */
mf.views.Weather.prototype.render = function() {
  mf.log('mf.views.Weather render');

  this.$el.html(mf.views.getTemplateHtml('weather', {
    prefs: this.prefs.getTemplateData(),
    weather: this.model.getTemplateData(),
    cities: mf.models.WeatherPrefs.Cities,
    months: mf.models.WeatherPrefs.Months,
    years: mf.models.WeatherPrefs.Years
  }));

  this.$form = this.$('form');
  this.$('[name="city"]').val(
      mf.models.WeatherPrefs.getStation(this.prefs.get('city')));
  this.$('[name="month"]').val(this.prefs.get('month'));
  this.$('[name="year"]').val(this.prefs.get('year'));

  this.$weatherData = this.$('.weather-data-c');
  this.subView.setElement(this.$weatherData);

  return this;
};



/******************************************************************************/



/**
 * @extends {Backbone.View}
 * @constructor
 */
mf.views.WeatherData = Backbone.View.extend({
  events: {}
});


/** @inheritDoc */
mf.views.WeatherData.prototype.initialize = function(options) {
  mf.log('views.WeatherData initialize');
  this.listenTo(this.model, 'change', this.render);
};


/** @inheritDoc */
mf.views.WeatherData.prototype.render = function() {
  mf.log('mf.views.WeatherData render');

  this.$el.html(mf.views.getTemplateHtml('weather_data',
      this.model.getTemplateData());
};

