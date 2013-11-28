


/******************************************************************************/



/**
 * @extends {Backbone.Model}
 * @constructor
 */
mf.models.App = Backbone.Model.extend();


/**
 * @return {Object} A weather prefs obj if matches in the URL.
 */
mf.models.App.getWeatherPrefsFromUrl = function() {
  var weatherPrefs;
  var re = new RegExp(/weather\/(.+)\/(.+)\/(.+)/);
  var matches = re.exec(window.location.href);
  if (matches) {
    weatherPrefs = {
      'city': mf.models.WeatherPrefs.getCity(matches[1]),
      'year': matches[2],
      'month': mf.models.WeatherPrefsMonths[matches[3] - 1]
    };
  }
  mf.log('weatherPrefs from URL', weatherPrefs);
  return weatherPrefs;
};


/** @inheritDoc */
mf.models.App.prototype.initialize = function(opt_data, opt_options) {
  mf.log('mf.models.App.initialize');
  this.weatherPrefs = new mf.models.WeatherPrefs(
      mf.models.App.getWeatherPrefsFromUrl());
  this.weatherData = new mf.models.WeatherData();
  this.onChangeWeatherPrefs_();  // init

  this.listenTo(this.weatherPrefs, 'change', this.onChangeWeatherPrefs_);
};


/** @private */
mf.models.App.prototype.onChangeWeatherPrefs_ = function() {
  mf.log('mf.models.App onChangeWeatherPrefs_', this.weatherPrefs.toJSON());
  this.weatherData.fetch({prefs: this.weatherPrefs});
};


/******************************************************************************/


/** @type {Array.<string>} */
mf.models.WeatherPrefsCities = [
  {
    'pws': 'KCAEUREK5',
    'name': 'Eureka'
  },
  {
    'pws': 'KCAMENDO1',
    'name': 'Mendocino'
  },
  {
    'pws': 'KCAINVER2',
    'name': 'Inverness'
  },
  {
    'pws': 'KCASANFR34',  // Twin Peaks
    'name': 'San Francisco'
  },
  {
    'pws': 'KCASANTA134', // Walnut/King
    'name': 'Santa Cruz'
  }
];


/** @type {Array.<string>} */
mf.models.WeatherPrefsMonths = [
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
mf.models.WeatherPrefsYears = [2013];


/******************************************************************************/



/**
 * @extends {Backbone.Model}
 * @constructor
 */
mf.models.WeatherPrefs = mf.Model.extend({
  defaults: {
    'city': mf.models.WeatherPrefsCities[0]['name'],
    'month': mf.models.WeatherPrefsMonths[(new Date()).getMonth()],
    'year': (new Date()).getFullYear()
  }
});


/**
 * @param {string} city A city name.
 * @return {string} A station.
 */
mf.models.WeatherPrefs.getStation = function(city) {
  for (var i = 0, cityObj; cityObj = mf.models.WeatherPrefsCities[i]; i++) {
    if (cityObj['name'] == city) {
      return cityObj['pws'];
    }
  }
};


/**
 * @param {string} station A station name.
 * @return {string} A city.
 */
mf.models.WeatherPrefs.getCity = function(station) {
  mf.log('mf.models.WeatherPrefs.getCity', station);
  for (var i = 0, cityObj; cityObj = mf.models.WeatherPrefsCities[i]; i++) {
    if (cityObj['pws'] == station) {
      return cityObj['name'];
    }
  }
};


/**
 * Based on prefs, we should be on this URL.
 * @return {string} The url.
 */
mf.models.WeatherPrefs.prototype.getUrlState = function() {
  return '/weather/' + this.getStation() +
        '/' + this.get('year') + '/' +
        mf.models.WeatherData.padMonth(this.getMonthNum());
};


/** @return {string} A station name. */
mf.models.WeatherPrefs.prototype.getStation = function() {
  return mf.models.WeatherPrefs.getStation(this.get('city'));
};


/** @return {string} The month as a number starting from 1, not 0 index. */
mf.models.WeatherPrefs.prototype.getMonthNum = function() {
  return _.indexOf(mf.models.WeatherPrefsMonths, this.get('month')) + 1;
};



/** @inheritDoc */
mf.models.WeatherPrefs.prototype.getTemplateData = function() {
  var data = mf.Model.prototype.getTemplateData.call(this);
  data['station'] = this.getStation();
  return data;
};


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
  options.error = _.bind(function() {
    mf.log('Error in WeatherData fetch.');
    this.clear();
  }, this);
  window['app'].navigate(this.prefs.getUrlState(), {replace: true});
  mf.Model.prototype.fetch.call(this, options);
};


/**
 * @return {string} An url.
 */
mf.models.WeatherData.prototype.url = function() {
  var monthAsString = mf.models.WeatherData.padMonth(this.prefs.getMonthNum());
  var url = window.location.origin + '/wunderground/data/' +
      this.prefs.getStation() + '/' + this.prefs.get('year') + '/' +
      monthAsString + '/data.json';
  return url;
};

