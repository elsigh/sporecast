
$.ajaxSettings['xhrCount'] = 0;

// Yep, we need zepto to work with CORS and cookies.
$.ajaxSettings['beforeSend'] = function(xhr, settings) {
  xhr.withCredentials = true;
  $.ajaxSettings['xhrCount']++;
  $('.mf-app > .mf-loading').show();
};

$.ajaxSettings['complete'] = function(xhr, status) {
  $.ajaxSettings['xhrCount']--;
  if ($.ajaxSettings['xhrCount'] === 0) {
    $('.mf-app > .mf-loading').hide();
  }
};

/*
$.ajaxSettings['success'] = function(xhr, status) {
  // noop
};
$.ajaxSettings['error'] = function(xhr, status) {
  // noop
};
*/

// Proxy click as zepto tap so we can bind to "tap"
$(document).ready(function(e) {
  var shouldPreventDefault = function(el) {
    var tagName = el.tagName.toLowerCase();
    switch (tagName) {
      case 'input':
      case 'select':
      case 'textarea':
      case 'label':
        return false;
        break;
      default:
        return true;
    }
  };
  // only do this if not on a touch device
  if (!('ontouchend' in window)) {
    $(document.body).on('click', function(e) {
      if (shouldPreventDefault(e.target)) {
        e.preventDefault();
        $(e.target).trigger('tap', e);
      }
    });

  // Nuke ghost clicks on touch devices.
  } else {
    $(document.body).on('click', function(e) {
      if (shouldPreventDefault(e.target)) {
        e.preventDefault();
      }
    });
  }
});


/**
 * @type {Object} Views namespace.
 */
mf.views = {};


/**
 * @param {string} name The template name.
 * @param {Object=} opt_data The template data.
 * @param {Object=} opt_partials Template partials.
 * @return {string} The template as HTML.
 */
mf.views.getTemplateHtml = function(name, opt_data, opt_partials) {
  var data = opt_data || {};
  _.extend(data, {
    'global_external_protocol': window.location.protocol == 'file:' ?
        'http' : window.location.protocol,
    'api_server': mf.models.SERVER,
    'is_android': mf.ua.IS_ANDROID,
    'is_ios': mf.ua.IS_IOS
  });
  var html = window['templates'][name].render(data, opt_partials);
  return html;
};


/**
 * A helper like benalman's jQuery serializeObject.
 * @param {Element|Zepto} form A form element reference.
 * @return {Object} A dictionary of name value pairs.
 */
mf.views.serializeFormToObject = function(form) {
  var data = {};
  var $form = $(form);
  var arrayData = $form.serializeArray();
  _.each(arrayData, function(obj) {
    if (obj.name) {

      // Allows for inclusion of input values as objects, i.e:
      // <input data-form-obj="foo" name="bar" value="baz">
      // will result in data['foo']['bar'] = 'baz'.
      var objKey = $form.
          find('input[name="' + obj.name + '"]').
          data('form-obj');

      // Allows for the includes of input values as arrays, i.e:
      // <input data-form-array="foo" name="foo-0" value="baz">
      // <input data-form-array="foo" name="foo-1" value="bat">
      // will result in data['foo'] = ['baz', 'bat'].
      var arrayKey = $form.
          find('input[name="' + obj.name + '"]').
          data('form-array');

      if (objKey) {
        if (!data[objKey]) {
          data[objKey] = {};
        }
        data[objKey][obj.name] = obj.value;

      } else if (arrayKey) {
        if (!data[arrayKey]) {
          data[arrayKey] = [];
        }
        data[arrayKey].push(obj.value);

      } else {
        data[obj.name] = obj.value;
      }
    }
  });
  return data;
};


/**
 * @param {string} msg The message to show.
 */
mf.views.showSpinner = function(msg) {
  if (navigator.notification && navigator.notification.activityStart) {
    navigator.notification.activityStart('', msg);
  } else {
    mf.log('GAH!!!! No activityStart available.');
    mf.views.showMessage(msg);
  }
};


/**
 * Hide that notification.
 */
mf.views.hideSpinner = function() {
  if (navigator.notification && navigator.notification.activityStop) {
    navigator.notification.activityStop();
  }
};


/**
 * @param {string} msg The message to show.
 */
mf.views.showMessage = function(msg) {
  mf.views.clearHideMessageTimeout_();
  $('.mf-msg').text(msg);
  $('.mf-msg-c').css('opacity', '0').show().animate({
    opacity: 1
  }, 250, 'linear', mf.views.hideMessage_);
};


/**
 * @private {number}
 */
mf.views.hideMessageTimeout_ = null;


/**
 * @private
 */
mf.views.clearHideMessageTimeout_ = function() {
  if (mf.views.hideMessageTimeout_ !== null) {
    window.clearTimeout(mf.views.hideMessageTimeout_);
    mf.views.hideMessageTimeout_ = null;
  }
};


/**
 * @private
 */
mf.views.hideMessage_ = function() {
  mf.views.clearHideMessageTimeout_();
  mf.views.hideMessageTimeout_ = _.delay(
      function() {
        $('.mf-msg-c').animate(
            {
              opacity: 0
            },
            1000,
            'linear',
            function() {
              $('.mf-msg-c').hide();
            });
      }, 2000);
};


/******************************************************************************/



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

  this.subViews_ = {};
  this.$month = $('<div class="for-month">Month data</div>');
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
    cities: mf.models.Cities,
    months: mf.models.Months,
    years: mf.models.Years
  }));

  this.$('[name="city"]').val(this.prefs.get('city'));
  this.$('[name="month"]').val(this.prefs.get('month'));
  this.$('[name="year"]').val(this.prefs.get('year'));

  this.$el.append(this.$month);
  this.$form = this.$('form');

  return this;
};


