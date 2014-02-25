/**
 * @fileoverview This is a file of base classes and static functions.
 * The actual app code lives in plain-ole models.js.
 */


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
sc.models.SERVER_PROD = window.location.hostname.indexOf('appspot') !== -1 ?
    'http://mushroomforecast.appspot.com' :
    'http://www.sporecast.net';

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


/******************************************************************************/



/**
 * @extends {Backbone.Model}
 * @constructor
 */
sc.Collection = Backbone.Collection.extend();


/**
 * @return {Object} A template data object.
 */
sc.Collection.prototype.getTemplateData = function() {
  return this.map(function(model) {
    return model.getTemplateData();
  });
};
