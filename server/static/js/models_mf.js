

/**
 * @type {Object} Models namespace.
 */
mf.models = {};


/**
 * @type {string}
 */
mf.models.SERVER_LOCAL = 'http://localhost:8090';


/**
 * @type {string}
 */
mf.models.SERVER_PROD = 'https://mushroomobserver.appspot.com';

// Useful for testing from the filesystem locally.
//mf.models.SERVER_PROD = mf.models.SERVER_LOCAL;
//mf.models.SERVER_LOCAL = mf.models.SERVER_PROD;


/**
 * @return {string} The server endpoint.
 */
mf.models.getServer = function() {
  return (mf.ua.IS_APP || mf.ua.IS_PROD_WEB_APP) && !mf.ua.isSimulator() ?
      mf.models.SERVER_PROD : mf.models.SERVER_LOCAL;
};


/******************************************************************************/



/**
 * @extends {mf.Model}
 * @constructor
 */
mf.models.AjaxSyncModel = Backbone.Model.extend({
  sync: mf.models.sync
});


/******************************************************************************/



/**
 * @extends {Backbone.Model}
 * @constructor
 */
mf.Model = Backbone.Model.extend();


/**
 * @return {Object} A template data object.
 */
mf.Model.prototype.getTemplateData = function() {
  var templateData = {};

  _.each(this.toJSON(), function(val, key) {
    if (!_.isUndefined(val)) {
      templateData[key] = val;
    }
  });

  return templateData;
};


/**
 * @param {Object=} opt_data Data to save.
 * @param {Object=} opt_options Options config.
 */
mf.Model.prototype.saveToServer = function(opt_data, opt_options) {
  mf.log('mf.Model saveToServer id', this.id);
  var options = opt_options || {};
  options['server_only'] = true;
  this.save(opt_data, options);
};


/**
 * Note: Our modified copy of Backbone.localStorage assumes this
 * function's existence.
 * @return {Object} Overridable by subclasses.
 */
mf.Model.prototype.getStorageData = function() {
  //mf.log('mf.Model getStorageData');
  var data = mf.clone(this.toJSON());
  return data;
};


/**
 * @param {Object=} opt_data A data obj.
 * @param {Object=} opt_options An options config.
 */
mf.Model.prototype.saveToStorage = function(opt_data, opt_options) {
  mf.log('mf.Model saveToStorage id', this.id);
  var options = opt_options || {};
  options['local_storage_only'] = true;
  this.save(opt_data, options);
};


/**
 * @param {Object=} opt_options Options config.
 */
mf.Model.prototype.fetchFromStorage = function(opt_options) {
  // Pretend to be async.
  _.defer(_.bind(function() {
    var results = this.localStorage.findAll();
    //mf.log('mf.Model fetchFromStorage RESULTS:', results);
    if (results.length) {
      //mf.log('mf.Model fetchFromStorage set', results[results.length - 1]);
      this.set(results[results.length - 1], opt_options);
    }
    opt_options && opt_options.fetchComplete &&
        opt_options.fetchComplete();
  }, this));
};
