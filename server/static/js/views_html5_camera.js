


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
    'tap .take-photo': 'onClickTakePhoto_',
    'tap .take-snapshot': 'onClickTakeSnapshot_',
    'tap .close': 'remove'
  }
});


/** @override */
sc.views.Html5Camera.prototype.render = function() {
  this.setElement(sc.views.getTemplateHtml('html5camera', {}));
  this.$video = this.$('video');
  this.$img = this.$('img');
  this.$canvas = this.$('canvas');
  this.canvasCtx = this.$canvas.get(0).getContext('2d');
  $('body').append(this.$el);
};


/**
 * @param {Event} e A click event.
 * @private
 */
sc.views.Html5Camera.prototype.onClickTakePhoto_ = function(e) {
  if (navigator.getUserMedia) {
    navigator.getUserMedia({video: true, audio: true},
        _.bind(this.onGetUserMediaSuccess_, this),
        _.bind(this.onGetUserMediaFail_, this));
  } else {
    alert('sorry nothing for you yet without getUserMedia');
  }
};


/**
 * @param {Object} e An error object.
 * @private
 */
sc.views.Html5Camera.prototype.onGetUserMediaFail_ = function(e) {
  sc.log('Rejected', e);
};


/**
 * @param {Object} stream A video stream
 * @private
 */
sc.views.Html5Camera.prototype.onGetUserMediaSuccess_ = function(stream) {
  this.stream_ = stream;
  this.$video.attr('src', window.URL.createObjectURL(this.stream_));
};


/** @private */
sc.views.Html5Camera.prototype.onClickTakeSnapshot_ = function() {
  if (!this.stream_) {
    return;
  }
  // "image/webp" works in Chrome. Other browsers will fall back to image/png.
  this.canvasCtx.drawImage(this.$video.get(0), 0, 0);
  this.$img.attr('src', this.$canvas.get(0).toDataURL('image/webp'));
};
