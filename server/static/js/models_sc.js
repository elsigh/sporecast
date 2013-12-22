

/**
 * @type {Object} Models namespace.
 */
sc.models = {};


/**
 * @type {string}
 */
sc.models.SERVER_LOCAL = 'http://localhost:8090';


/**
 * @type {string}
 */
sc.models.SERVER_PROD = 'http://mushroomforecast.appspot.com';

// Useful for testing from the filesystem locally.
//sc.models.SERVER_PROD = sc.models.SERVER_LOCAL;
//sc.models.SERVER_LOCAL = sc.models.SERVER_PROD;


/**
 * @return {string} The server endpoint.
 */
sc.models.getServer = function() {
  return (sc.ua.IS_APP || sc.ua.IS_PROD_WEB_APP) && !sc.ua.isSimulator() ?
      sc.models.SERVER_PROD : sc.models.SERVER_LOCAL;
};


/******************************************************************************/



/**
 * @extends {sc.Model}
 * @constructor
 */
sc.models.AjaxSyncModel = Backbone.Model.extend({
  sync: sc.models.sync
});


/******************************************************************************/



/**
 * @extends {Backbone.Model}
 * @constructor
 */
sc.Model = Backbone.Model.extend();


/**
 * @return {Object} A template data object.
 */
sc.Model.prototype.getTemplateData = function() {
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
sc.Model.prototype.saveToServer = function(opt_data, opt_options) {
  sc.log('sc.Model saveToServer id', this.id);
  var options = opt_options || {};
  options['server_only'] = true;
  this.save(opt_data, options);
};


/**
 * Note: Our modified copy of Backbone.localStorage assumes this
 * function's existence.
 * @return {Object} Overridable by subclasses.
 */
sc.Model.prototype.getStorageData = function() {
  //sc.log('sc.Model getStorageData');
  var data = sc.clone(this.toJSON());
  return data;
};


/**
 * @param {Object=} opt_data A data obj.
 * @param {Object=} opt_options An options config.
 */
sc.Model.prototype.saveToStorage = function(opt_data, opt_options) {
  sc.log('sc.Model saveToStorage id', this.id);
  var options = opt_options || {};
  options['local_storage_only'] = true;
  this.save(opt_data, options);
};


/**
 * @param {Object=} opt_options Options config.
 */
sc.Model.prototype.fetchFromStorage = function(opt_options) {
  // Pretend to be async.
  _.defer(_.bind(function() {
    var results = this.localStorage.findAll();
    //sc.log('sc.Model fetchFromStorage RESULTS:', results);
    if (results.length) {
      //sc.log('sc.Model fetchFromStorage set', results[results.length - 1]);
      this.set(results[results.length - 1], opt_options);
    }
    opt_options && opt_options.fetchComplete &&
        opt_options.fetchComplete();
  }, this));
};
