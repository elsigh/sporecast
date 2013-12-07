


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

  this.onChangeWeatherDataPrefs_();  // init link w/ correct href.
  this.listenTo(this.model.weatherData.prefs, 'change',
      this.onChangeWeatherDataPrefs_);
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


/** @private */
mf.views.App.prototype.onChangeWeatherDataPrefs_ = function() {
  var urlState = this.model.weatherData.prefs.getUrlState();
  $('.weather.mf-app-link').attr('href', urlState);

  // Quietly update the URL as appropo
  if (this.currentView == this.viewWeather) {
    window['app'].navigate(urlState, {replace: true});
  }
};


/**
 * @private
 */
mf.views.App.prototype.handleResizeOrientationChange_ = function() {
  this.setCurrentView(this.currentView);

  // Resize the scrollys.
  this.currentView && this.currentView.subView &&
      this.currentView.subView.render();
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
        model: this.model.weatherData
      });
      this.viewWeather.render();
    }
    newTab = 'weather';
    newView = this.viewWeather;

  } else if (_.isEqual(mf.App.Routes.MUSHROOM_OBSERVER, route)) {

    if (!this.viewMob) {
      this.viewMob = new mf.views.Mob({
        model: this.model.mobData
      });
      this.viewMob.render();
    }
    newTab = 'mob';
    newView = this.viewMob;

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
mf.views.Weather = mf.views.View.extend({
  el: '.mf-weather',
  events: {
    'change select': 'onChangePrefs_'
  }
});


/** @inheritDoc */
mf.views.Weather.prototype.initialize = function(options) {
  mf.log('views.Weather initialize');
  this.subView = new mf.views.WeatherData({
    model: this.model
  });
  if (!this.model.has('data')) {
    this.model.fetch();
  }
};


/** @private */
mf.views.Weather.prototype.onChangePrefs_ = function() {
  var obj = mf.views.serializeFormToObject(this.$form);
  mf.log('mf.views.Weather onChangePrefs_', obj);
  this.model.prefs.set(obj);
};


/** @inheritDoc */
mf.views.Weather.prototype.render = function() {
  mf.log('mf.views.Weather render');

  this.$el.html(mf.views.getTemplateHtml('weather', {
    prefs: this.model.prefs.getTemplateData(),
    cities: mf.models.WeatherPrefsCities,
    months: mf.models.WeatherPrefsMonths,
    years: mf.models.WeatherPrefsYears
  }));

  this.$form = this.$('form');
  this.$('[name="city"]').val(this.model.prefs.get('city'));
  this.$('[name="month"]').val(this.model.prefs.get('month'));
  this.$('[name="year"]').val(this.model.prefs.get('year'));

  this.$data = this.$('.data-c');
  this.subView.setElement(this.$data);
  this.subView.render();

  return this;
};



/******************************************************************************/



/**
 * @extends {Backbone.View}
 * @constructor
 */
mf.views.WeatherData = mf.views.View.extend({
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
      this.model.getTemplateData()));

  this.makeScrollTables();
};


/******************************************************************************/



/**
 * @extends {Backbone.View}
 * @constructor
 */
mf.views.Mob = mf.views.View.extend({
  el: '.mf-mob',
  events: {
    'change select': 'onChangePrefs_'
  }
});


/** @inheritDoc */
mf.views.Mob.prototype.initialize = function(options) {
  mf.log('mf.views.Mob initialize');
  this.subView = new mf.views.MobData({
    model: this.model
  });
  if (!this.model.has('data')) {
    this.model.fetch();
  }
};


/** @private */
mf.views.Mob.prototype.onChangePrefs_ = function() {
  var obj = mf.views.serializeFormToObject(this.$form);
  mf.log('mf.views.Mob onChangePrefs_', obj);
  this.model.prefs.set(obj);
};


/** @inheritDoc */
mf.views.Mob.prototype.render = function() {
  mf.log('mf.views.Mob render');

  this.$el.html(mf.views.getTemplateHtml('mob', {
    prefs: this.model.prefs.getTemplateData(),
    states: mf.models.MobPrefsStates
  }));

  this.$form = this.$('form');
  this.$('[name="state"]').val(this.model.prefs.get('state'));

  this.$data = this.$('.data-c');
  this.subView.setElement(this.$data);
  this.subView.render();

  return this;
};


/******************************************************************************/



/**
 * @extends {Backbone.View}
 * @constructor
 */
mf.views.MobData = mf.views.View.extend();


/** @inheritDoc */
mf.views.MobData.prototype.initialize = function(options) {
  mf.log('views.MobData initialize');
  this.listenTo(this.model, 'change', this.render);
};


/** @inheritDoc */
mf.views.MobData.prototype.render = function() {
  mf.log('mf.views.MobData render');

  this.$el.html(mf.views.getTemplateHtml('mob_data',
      this.model.getTemplateData()));

  this.$el.removeClass('mf-scroll-y');
  mf.views.View.setHeightAsAvailable(this.$el);
  this.$el.addClass('mf-scroll-y');
};

