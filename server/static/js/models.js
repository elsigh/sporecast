

/** @type {Array.<string>} */
mf.models.Cities = [
  'Mendocino',
  'San Francisco'
];


/** @type {Array.<string>} */
mf.models.Months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];


/** @type {Array.<number>} */
mf.models.Years = [2013, 2012];

/******************************************************************************/



/**
 * @extends {Backbone.Model}
 * @constructor
 */
mf.models.App = Backbone.Model.extend();


/** @inheritDoc */
mf.models.App.prototype.initialize = function(opt_data, opt_options) {
  mf.log('mf.models.App.initialize');
  this.weatherPrefs = new mf.models.WeatherPrefs();
  this.weatherData = new mf.models.WeatherData();

  this.listenTo(this.weatherPrefs, 'change', this.onChangeWeatherPrefs_);
};


/** @private */
mf.models.App.prototype.onChangeWeatherPrefs_ = function() {
  mf.log('mf.models.App onChangeWeatherPrefs_', this.weatherPrefs.toJSON());
  this.weatherData.fetch({prefs: this.weatherPrefs});
};


/******************************************************************************/



/**
 * @extends {Backbone.Model}
 * @constructor
 */
mf.models.WeatherPrefs = mf.Model.extend({
  defaults: {
    'city': mf.models.Cities[0],
    'month': mf.models.Months[(new Date()).getMonth()],
    'year': (new Date()).getFullYear()
  }
});


/******************************************************************************/



/**
 * @extends {Backbone.Model}
 * @constructor
 */
mf.models.WeatherData = mf.Model.extend();


/**
 * @param {number} number A number to pad.
 * @return {string} A padded number.
 */
mf.models.WeatherData.padMonth = function(number) {
  return (number < 10 ? '0' : '') + number;
};



/** @inheritDoc */
mf.models.WeatherData.prototype.fetch = function(options) {
  this.prefs = options.prefs;
  mf.Model.prototype.fetch.call(this, options);
};


/**
 * @return {string} An url.
 */
mf.models.WeatherData.prototype.url = function() {
  var monthAsString = mf.models.WeatherData.padMonth(
      _.indexOf(mf.models.Months, this.prefs.get('month')) + 1);
  var url = mf.models.getServer() + '/wunderground/data/CA/' +
      this.prefs.get('city') + '/' + this.prefs.get('year') +
      monthAsString + '.json';
  return url;
};

