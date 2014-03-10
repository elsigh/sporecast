/**
 * @fileoverview This is a file of base classes and static functions.
 * The actual app code lives in plain-ole views.js.
 */


$.ajaxSettings['xhrCount'] = 0;

/*
$.ajaxSettings['xhr'] = function() {
  // Support X-Domain in FFOS.
  var xhr = new window.XMLHttpRequest({mozSystem: true});
  bone.log('XHR object is gettinbg mozSystem setting!');
  return xhr;
};
*/

$.ajaxSettings['beforeSend'] = function(xhr, settings) {
  $.ajaxSettings['xhrCount']++;
  bone.View.showMessage('Loading data ...', false);
};

$.ajaxSettings['complete'] = function(xhr, status) {
  $.ajaxSettings['xhrCount']--;
  if ($.ajaxSettings['xhrCount'] === 0) {
    bone.View.hideMessage();
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

  window.setTimeout(function() {
    window.scrollTo(0, 1);
  }, 1000);
});



/**
 * @constructor
 * @extends {Backbone.View}
 */
bone.View = Backbone.View.extend();


/**
 * @param {string} name The template name.
 * @param {Object=} opt_data The template data.
 * @param {Object=} opt_partials Template partials.
 * @return {string} The template as HTML.
 */
bone.View.getTemplateHtml = function(name, opt_data, opt_partials) {
  var data = opt_data || {};
  _.extend(data, {
    'global_external_protocol': window.location.protocol == 'file:' ?
        'http' : window.location.protocol,
    'api_server': sc.models.SERVER,
    'is_android': bone.ua.IS_ANDROID,
    'is_ios': bone.ua.IS_IOS
  });
  var html = window['templates'][name].render(data, opt_partials);
  return html;
};


/**
 * A helper like benalman's jQuery serializeObject.
 * @param {Element|Zepto} form A form element reference.
 * @return {Object} A dictionary of name value pairs.
 */
bone.View.serializeFormToObject = function(form) {
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
bone.View.showMessage = function(msg, opt_autoHide) {
  bone.log('bone.View.hideMessage', msg, opt_autoHide);
  var callback = opt_autoHide === false ? function() {} :
      bone.View.hideMessage_;
  bone.View.clearHideMessageTimeout_();
  $('.sc-tab-frame').css('opacity', '0.5');
  $('.sc-msg').text(msg);

  callback();

  $('.sc-msg-c').css('opacity', '0').show().animate({
    opacity: 1
  }, 300, 'linear', callback);

};


/**
 * @private {number}
 */
bone.View.hideMessageTimeout_ = null;


/**
 * @private
 */
bone.View.clearHideMessageTimeout_ = function() {
  if (bone.View.hideMessageTimeout_ !== null) {
    window.clearTimeout(bone.View.hideMessageTimeout_);
    bone.View.hideMessageTimeout_ = null;
  }
};


/** Hide it */
bone.View.hideMessage = function() {
  bone.log('bone.View.hideMessage');
  bone.View.clearHideMessageTimeout_();
  $('.sc-msg-c').css('opacity', '1');
  $('.sc-msg-c').animate(
      {
        opacity: 0
      },
      500,
      'linear',
      function() {
        $('.sc-msg-c').hide();
      });
  $('.sc-tab-frame').css('opacity', '');
  /*
  $('.sc-tab-frame').animate(
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
bone.View.hideMessage_ = function() {
  bone.View.clearHideMessageTimeout_();
  bone.View.hideMessageTimeout_ = _.delay(
      bone.View.hideMessage, 1500);
};


/**
 * Makes the data container independently scrollable.
 * @param {Zepto} $el A zepto.
 * @return {number} The new height.
 */
bone.View.setHeightAsAvailable = function($el) {
  var screenW = document.documentElement.clientWidth;
  var screenH = document.documentElement.clientHeight;
  var offset = $el.offset();
  var PADDING_BOTTOM = 15;
  var availHeight = screenH - offset.top - PADDING_BOTTOM;
  //bone.log('bone.View setHeightAsAvailable',
  //    $el, availHeight, offset);

  $el.css('height', availHeight + 'px');
  return availHeight;
};


/**
 * Makes the data container independently scrollable.
 */
bone.View.prototype.makeScrollTables = function() {
  var $tables = this.$('table.sc-scroll-table:not(.sc-scroll-table-ready)');
  //bone.log('bone.View makeScrollTables', $tables);

  var that = this;
  $tables.each(function(i, table) {
    var $table = $(table);

    var $tbody = $table.find('tbody');
    var $tbodyClone = $tbody.clone();
    var $theadClone = $table.find('thead').clone();

    // Capture the original column widths.
    var widths = [];
    $table.find('thead th').each(function(i, th) {
      var $th = $(th);
      var width = $th.offset().width;
      widths.push(width);
      // Ensures that the cells remain the proper width once the tbody
      // gets wiped out.
      $th.css('width', width + 'px');
    });

    // Nuke the old DOM.
    $tbody.html('');

    var $tr = $('<tr>');

    var $td = $('<td>');
    $td.attr('colspan', $table.find('th').length);
    $td.addClass('sc-scroll-table-td');

    var $newTable = $('<table>').
        append($theadClone).
        append($tbodyClone);

    // Clear the cloned table headers, but use them to set the width
    // so the embedded table columns and header table columns match.
    $newTable.find('th').each(function(i, th) {
      var $th = $(th);
      $th.css('width', widths[i] + 'px').html('');
    });

    var $div = $('<div>').append($newTable);
    $td.append($div);
    $tr.append($td);
    $tbody.append($tr);

    $table.addClass('sc-scroll-table-ready');

    $table.find('img').each(function(i, img) {
      $('img').on('load', function() {
        that.resizeScrollTables_();
      });
    });
  });

  this.resizeScrollTables_();
};

/** @private */
bone.View.prototype.resizeScrollTables_ = function() {
  this.$('table.sc-scroll-table').each(function(i, table) {
    var $table = $(table);
    var $div = $table.find('.sc-scroll-table-td > div');
    $div.removeClass('sc-scroll-y');

    var theadHeight = $table.find('thead').offset().height;
    var tfootHeight = $table.find('tfoot').offset().height;
    var tableHeight = bone.View.setHeightAsAvailable($table);

    var divHeight = tableHeight - theadHeight - tfootHeight;
    $div.css('height', divHeight + 'px');
    $div.addClass('sc-scroll-y');
  });
};
