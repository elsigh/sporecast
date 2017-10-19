


/** X-browser */
navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia ||
                         navigator.msGetUserMedia;


/**
 * Based on http://www.html5rocks.com/en/tutorials/getusermedia/intro/
 * @extends {Backbone.View}
 * @constructor
 */
sc.views.Html5Camera = Backbone.View.extend({
  el: '.sc-html5-camera',
  events: {
    'tap .take-snapshot': 'onClickTakeSnapshot_',
    'tap .use-snapshot': 'onClickUseSnapshot_',
    'tap .close': 'remove'
  }
});


/** @override */
sc.views.Html5Camera.prototype.initialize = function() {
  bone.log('sc.views.Html5Camera initialize!');
  if (navigator.getUserMedia) {
    this.render();
    navigator.getUserMedia(
        {
          video: true,
          audio: false
        },
        _.bind(this.onGetUserMediaSuccess_, this),
        _.bind(this.onGetUserMediaFail_, this));
  } else {
    alert('sorry nothing for you yet without getUserMedia');
  }
};


/** @override */
sc.views.Html5Camera.prototype.render = function() {
  this.setElement(bone.View.getTemplateHtml('html5camera', {}));
  this.$el.on('click', function(e) {
    if ($(e.target).hasClass('sc-html5-camera')) {
      e.stopPropagation();
      bone.log('stopped clickery');
    }
  });
  this.$video = this.$('video');
  this.$img = this.$('img');
  this.$canvas = this.$('canvas');
};


/** @override */
sc.views.Html5Camera.prototype.remove = function() {
  bone.log('Html5Camera removery');
  this.trigger('html5camera:close');
  if (this.stream_ && this.stream_.stop) {
    this.stream_.stop();
  }
  Backbone.View.prototype.remove.call(this);
};


/**
 * @param {Object} e An error object.
 * @private
 */
sc.views.Html5Camera.prototype.onGetUserMediaFail_ = function(e) {
  bone.log('Rejected', e);
  this.remove();
};


/**
 * @param {Object} stream A video stream
 * @private
 */
sc.views.Html5Camera.prototype.onGetUserMediaSuccess_ = function(stream) {
  this.stream_ = stream;
  this.$video.attr('src', window.URL.createObjectURL(this.stream_));
  $('body').append(this.$el);
};


/** @private */
sc.views.Html5Camera.prototype.onClickTakeSnapshot_ = function() {
  if (!this.stream_) {
    return;
  }
  this.$('.use-snapshot').removeAttr('disabled');

  var videoEl = this.$video.get(0);

  var offset = this.$video.offset();
  //this.$img.width(videoEl.videoWidth);
  //this.$img.height(videoEl.videoWidth);

  this.$img.height(offset.height);
  this.$canvas.height(offset.height);

  this.$canvas.get(0).getContext('2d').drawImage(
      videoEl, 0, 0,
      offset.width, offset.height);
  // "image/webp" works in Chrome. Other browsers will fall back to image/png.
  this.$img.attr('src', this.$canvas.get(0).toDataURL('image/webp'));
};


/** @private */
sc.views.Html5Camera.prototype.onClickUseSnapshot_ = function() {
  this.trigger('html5camera:use-snapshot-src', [this.$img.attr('src')]);
  this.remove();
};
