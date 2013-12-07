
$.ajaxSettings['xhrCount'] = 0;

// Yep, we need zepto to work with CORS and cookies.
$.ajaxSettings['beforeSend'] = function(xhr, settings) {
  xhr.withCredentials = true;
  $.ajaxSettings['xhrCount']++;
  mf.views.showMessage('Loading data ...', false);
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

  window.setTimeout(function() {
    window.scrollTo(0, 1);
  }, 1000);
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
  mf.log('mf.views.hideMessage', msg, opt_autoHide);
  var callback = opt_autoHide === false ? function() {} :
      mf.views.hideMessage_;
  mf.views.clearHideMessageTimeout_();
  $('.mf-tab-frame').css('opacity', '0.5');
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
  mf.log('mf.views.hideMessage');
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
  $('.mf-tab-frame').css('opacity', '');
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
 * @param {Zepto} $el A zepto.
 * @return {number} The new height.
 */
mf.views.View.setHeightAsAvailable = function($el) {
  var screenW = document.documentElement.clientWidth;
  var screenH = document.documentElement.clientHeight;
  var offset = $el.offset();
  var PADDING_BOTTOM = 15;
  var availHeight = screenH - offset.top - PADDING_BOTTOM;
  mf.log('mf.views.View setHeightAsAvailable',
      $el, availHeight, offset);

  $el.css('height', availHeight + 'px');
  return availHeight;
};


/**
 * Makes the data container independently scrollable.
 */
mf.views.View.prototype.makeScrollTables = function() {
  var $tables = this.$('table.mf-scroll-table:not(.mf-scroll-table-ready)');
  mf.log('mf.views.View makeScrollTables', $tables);

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
    $td.addClass('mf-scroll-table-td');

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

    $table.addClass('mf-scroll-table-ready');

    $table.find('img').each(function(i, img) {
      $('img').on('load', function() {
        that.resizeScrollTables_();
      });
    });
  });

  this.resizeScrollTables_();
};

/** @private */
mf.views.View.prototype.resizeScrollTables_ = function() {
  this.$('table.mf-scroll-table').each(function(i, table) {
    var $table = $(table);
    var $div = $table.find('.mf-scroll-table-td > div');
    $div.removeClass('mf-scroll-y');

    var theadHeight = $table.find('thead').offset().height;
    var tfootHeight = $table.find('tfoot').offset().height;
    var tableHeight = mf.views.View.setHeightAsAvailable($table);

    var divHeight = tableHeight - theadHeight - tfootHeight;
    $div.css('height', divHeight + 'px');
    $div.addClass('mf-scroll-y');
  });
};
