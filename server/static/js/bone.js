/**
 * @fileoverview This is a file of base classes and static functions.
 */


/**
 * @type {Object}
 */
var bone = {};


/**
 * Catch-all for whatever goes wrong.
 * TODO(elsigh): Report to a server.
 * @param {string} message Error msg.
 * @param {string} url Error url.
 * @param {string} lineNumber Error line num.
 */
window.onerror = function(message, url, lineNumber) {
  window.console.log('window.onerror GLOBAL FAIL: ' + message + ', ' +
      url + ', ' + lineNumber);
};


/******************************************************************************/


/**
 * @type {Object} UA namespace.
 */
bone.ua = {};


/** @type {string} */
bone.ua.LOWER_CASE = window.navigator.userAgent.toLowerCase();


/**
 * @return {boolean}
 */
bone.ua.getPlatform = function() {
  return window.device && window.device.platform ?
      window.device.platform.toLowerCase() : 'desktop';
};


/**
 * @return {boolean}
 */
bone.ua.isSimulator = function() {
  return window.device && window.device.model &&
         (window.device.model == 'x86_64' ||  // ios simulator
          window.device.model == 'simulator');  // whatever on droid
};


/**
 * @type {boolean}
 */
bone.ua.IS_ANDROID = bone.ua.LOWER_CASE.indexOf('android') !== -1;


/**
 * @type {boolean}
 */
bone.ua.IS_IOS = bone.ua.LOWER_CASE.indexOf('iphone') !== -1 ||
               bone.ua.LOWER_CASE.indexOf('ipad') !== -1;


/**
 * @type {boolean}
 */
bone.ua.IS_FIREFOX_OS = 'mozApps' in window.navigator &&
                      bone.ua.LOWER_CASE.indexOf('mobile') !== -1;


/**
 * @type {boolean}
 */
bone.ua.IS_CORDOVA = typeof cordova !== 'undefined';


/**
 * The running app, and not the simulator.
 * @type {boolean}
 */
bone.ua.IS_APP = (window.location.protocol === 'file:' ||
                window.location.protocol === 'app:') &&
               bone.ua.IS_CORDOVA &&
               (bone.ua.IS_ANDROID || bone.ua.IS_IOS || bone.ua.IS_FIREFOX_OS);


/**
 * The hosted web app.
 * @type {boolean}
 */
bone.ua.IS_PROD_WEB_APP = window.location.hostname.indexOf('appspot') !== -1 ||
    window.location.hostname.indexOf('sporecast.net') !== -1;


/******************************************************************************/


/**
 * @return {Function} The native console.log implementation.
 * @private
 */
bone.getConsoleLogger_ = function() {
  return _.bind(console.log, console);
};


/**
 * @return {Function} A wrapped up stringifier.
 * @private
 */
bone.getWebViewLogger_ = function() {
  return _.bind(function() {
    var argumentsArray = _.toArray(arguments);
    var consoleStrings = [];
    _.each(argumentsArray, function(logLine) {
      if (_.isElement(logLine)) {
        consoleStrings.push('isElement-className: ' + logLine.className);
      } else if (_.isObject(logLine)) {
        // Some of our objects have circular references..
        try {
          // Wrapped in quotation marks for later parseability.
          var stringified = '"' + JSON.stringify(logLine) + '"';
          consoleStrings.push(stringified);
        } catch (err) {
          consoleStrings.push(logLine);
        }
      } else {
        consoleStrings.push(logLine);
      }
    });

    var consoleString = consoleStrings.join(', ');
    console.log(consoleString);
  }, console);
};


/**
 * @param {string} src The script src.
 */
bone.injectScript = function(src) {
  script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.onload = function() {
    // remote script has loaded
  };
  script.src = src;
  $('head').get(0).appendChild(script);
};


/**
 * Good times, wrap bone.log
 */
bone.log = bone.ua.IS_APP ?
    bone.getWebViewLogger_() : bone.getConsoleLogger_();


/**
 * @param {Object} obj An object to clone.
 * @return {Object} A deep clone of the passed in object.
 */
bone.clone = function(obj) {
  return JSON.parse(JSON.stringify(obj));
};


/**
 * @param {number} time An ISO time.
 * @return {string} A pretty representation of the time.
 */
bone.prettyDate = function(time) {
  var date = new Date(time),
      diff = (((new Date()).getTime() - date.getTime()) / 1000),
      dayDiff = Math.floor(diff / 86400);
  if (isNaN(dayDiff) || dayDiff < 0 || dayDiff >= 31) {
    return 'a bit ago';
  }

  return dayDiff === 0 && (
      diff < 60 && 'just now' ||
      diff < 120 && '1 min' ||
      diff < 3600 && Math.floor(diff / 60) + ' min' ||
      diff < 7200 && '1 hour' ||
      diff < 86400 && Math.floor(diff / 3600) + ' hours') ||
      dayDiff == 1 && 'Yesterday' ||
      dayDiff < 7 && dayDiff + ' days' ||
      dayDiff < 31 && Math.ceil(dayDiff / 7) + ' weeks';
};
