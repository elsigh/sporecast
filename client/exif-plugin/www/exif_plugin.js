
var exec = require('cordova/exec');


/**
 * @param {Function} win Success callback.
 * @param {Function} fail Error callback.
 * @param {string} filename The photo file name/path on the device.
 * @return {Function} A Cordova exec.
 */
exports.removeGeoTags = function(win, fail, filename) {
  return exec(win, fail, 'ExifPlugin', 'removeGeoTags', [filename]);
};
