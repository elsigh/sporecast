

/**
 * @type {Object}
 */
var mf = {};


/******************************************************************************/


/**
 * @type {Object} UA namespace.
 */
mf.ua = {};


/**
 * @return {boolean}
 */
mf.ua.getPlatform = function() {
  return window.device ? window.device.platform.toLowerCase() : 'desktop';
};


/**
 * @return {boolean}
 */
mf.ua.isSimulator = function() {
  return window.device && window.device.model &&
         (window.device.model == 'x86_64' ||  // ios simulator
          window.device.model == 'simulator');  // whatever on droid
};


/**
 * @type {boolean}
 */
mf.ua.IS_ANDROID =
    window.navigator.userAgent.toLowerCase().indexOf('android') !== -1;


/**
 * @type {boolean}
 */
mf.ua.IS_IOS =
    window.navigator.userAgent.toLowerCase().indexOf('iphone') !== -1 ||
    window.navigator.userAgent.toLowerCase().indexOf('ipad') !== -1;


/**
 * @type {boolean}
 */
mf.ua.IS_CORDOVA = typeof cordova !== 'undefined';


/**
 * The running app, and not the simulator.
 * @type {boolean}
 */
mf.ua.IS_APP = window.location.protocol === 'file:' &&
                mf.ua.IS_CORDOVA &&
                (mf.ua.IS_ANDROID || mf.ua.IS_IOS);


/**
 * The hosted web app.
 * @type {boolean}
 */
mf.ua.IS_PROD_WEB_APP = window.location.hostname == 'www.levelsapp.com';


/******************************************************************************/


/**
 * @return {Function} The native console.log implementation.
 * @private
 */
mf.getConsoleLogger_ = function() {
  return _.bind(console.log, console);
};


/**
 * @return {Function} A wrapped up stringifier.
 * @private
 */
mf.getWebViewLogger_ = function() {
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
mf.injectScript = function(src) {
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
 * Good times, wrap mf.log
 */
mf.log = mf.ua.IS_APP ?
    mf.getWebViewLogger_() : mf.getConsoleLogger_();


/**
 * @param {Object} obj An object to clone.
 * @return {Object} A deep clone of the passed in object.
 */
mf.clone = function(obj) {
  return JSON.parse(JSON.stringify(obj));
};
