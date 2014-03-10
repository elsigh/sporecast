


/**
 * @extends {Backbone.Model}
 * @constructor
 */
bone.Model = Backbone.Model.extend();


/**
 * @return {Object} A template data object.
 */
bone.Model.prototype.getTemplateData = function() {
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
bone.Collection = Backbone.Collection.extend();


/**
 * @return {Object} A template data object.
 */
bone.Collection.prototype.getTemplateData = function() {
  return this.map(function(model) {
    return model.getTemplateData();
  });
};
