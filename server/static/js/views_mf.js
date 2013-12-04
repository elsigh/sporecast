
$.ajaxSettings['xhrCount'] = 0;

// Yep, we need zepto to work with CORS and cookies.
$.ajaxSettings['beforeSend'] = function(xhr, settings) {
  xhr.withCredentials = true;
  $.ajaxSettings['xhrCount']++;
  mf.views.showMessage('Loading data ...');
};

$.ajaxSettings['complete'] = function(xhr, status) {
  $.ajaxSettings['xhrCount']--;
  if ($.ajaxSettings['xhrCount'] === 0) {
    mf.views.hideMessage();
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
 * @param {boolean=} opt_autoHide Pass false to not hide it automatically.
 */
mf.views.showMessage = function(msg, opt_autoHide) {
  var callback = opt_autoHide === false ? function() {} :
      mf.views.hideMessage_;
  mf.views.clearHideMessageTimeout_();
  //$('.mf-tab-frame').css('opacity', '0.5');
  $('.mf-msg').text(msg);

  callback();

  $('.mf-msg-c').css('opacity', '0').show().animate({
    opacity: 1
  }, 300, 'linear', callback);

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


/** Hide it */
mf.views.hideMessage = function() {
  mf.views.clearHideMessageTimeout_();
  $('.mf-msg-c').css('opacity', '1');
  $('.mf-msg-c').animate(
      {
        opacity: 0
      },
      500,
      'linear',
      function() {
        $('.mf-msg-c').hide();
      });
  /*
  $('.mf-tab-frame').animate(
      {
        opacity: 1
      },
      500,
      'linear',
      function() {
        // add done
      });
  */
};


/**
 * @private
 */
mf.views.hideMessage_ = function() {
  mf.views.clearHideMessageTimeout_();
  mf.views.hideMessageTimeout_ = _.delay(
      mf.views.hideMessage, 1500);
};


/****** MF VIEW ********/
mf.views.View = Backbone.View.extend();


/**
 * Makes the data container independently scrollable.
 */
mf.views.View.prototype.setDataContainersScrollY = function() {
  var screenW = document.documentElement.clientWidth;
  var screenH = document.documentElement.clientHeight;
  var $el = this.$el;
  var offset = $el.offset();
  var availHeight = screenH - offset.top;
  mf.log('mf.views.View setDataContainersScrollY',
      this.el, availHeight, offset);

  $el.addClass('mf-scroll-y');
  $el.css('height', availHeight + 'px');
  /*
  if (offset.height > availHeight) {
    $el.addClass('mf-scroll-y');
    $el.css('height', availHeight + 'px');
  } else {
    $el.removeClass('mf-scroll-y');
    $el.css('height', '');
  }
  */
};
