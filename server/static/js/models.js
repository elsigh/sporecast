


/******************************************************************************/



/**
 * @extends {Backbone.Model}
 * @constructor
 */
sc.models.App = Backbone.Model.extend();



/** @inheritDoc */
sc.models.App.prototype.initialize = function(opt_data, opt_options) {
  sc.log('sc.models.App.initialize');

  this.weatherData = new sc.models.WeatherData();
  this.mobData = new sc.models.MobData();
};


/******************************************************************************/


/** @type {Array.<string>} */
sc.models.WeatherPrefsCities = [
  {
    'pws': 'KCAEUREK5',
    'name': 'Eureka'
  },
  {
    'pws': 'KCAMENDO1',
    'name': 'Mendo'
  },
  {
    'pws': 'KCAINVER2',
    'name': 'Inverness'
  },
  {
    'pws': 'KCASANFR34',  // Twin Peaks
    'name': 'San Fran'
  },
  {
    'pws': 'KCASANTA134', // Walnut/King
    'name': 'Santa Cruz'
  }
];


/** @type {Array.<string>} */
sc.models.WeatherPrefsMonths = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];


/** @type {Array.<number>} */
sc.models.WeatherPrefsYears = [2014, 2013];


/******************************************************************************/



/**
 * @extends {Backbone.Model}
 * @constructor
 */
sc.models.WeatherPrefs = sc.Model.extend({
  defaults: {
    'city': sc.models.WeatherPrefsCities[0]['name'],
    'month': sc.models.WeatherPrefsMonths[(new Date()).getMonth()],
    'year': (new Date()).getFullYear()
  }
});


/**
 * @param {string} city A city name.
 * @return {string} A station.
 */
sc.models.WeatherPrefs.getStation = function(city) {
  for (var i = 0, cityObj; cityObj = sc.models.WeatherPrefsCities[i]; i++) {
    if (cityObj['name'] == city) {
      return cityObj['pws'];
    }
  }
};


/**
 * @param {string} station A station name.
 * @return {string} A city.
 */
sc.models.WeatherPrefs.getCity = function(station) {
  sc.log('sc.models.WeatherPrefs.getCity', station);
  for (var i = 0, cityObj; cityObj = sc.models.WeatherPrefsCities[i]; i++) {
    if (cityObj['pws'] == station) {
      return cityObj['name'];
    }
  }
};


/**
 * @return {Object} A weather prefs obj if matches in the URL.
 */
sc.models.WeatherPrefs.getFromUrl = function() {
  var weatherPrefs;
  var re = new RegExp(/weather\/(.+)\/(.+)\/(.+)/);
  var matches = re.exec(window.location.href);
  if (matches) {
    weatherPrefs = {
      'city': sc.models.WeatherPrefs.getCity(matches[1]),
      'year': matches[2],
      'month': sc.models.WeatherPrefsMonths[matches[3] - 1]
    };
  }
  sc.log('sc.models.WeatherData getPrefsFromUrl', weatherPrefs);
  return weatherPrefs;
};


/**
 * Based on prefs, we should be on this URL.
 * @return {string} The url.
 */
sc.models.WeatherPrefs.prototype.getUrlState = function() {
  return 'weather/' + this.getStation() +
        '/' + this.get('year') + '/' +
        sc.models.WeatherData.padMonth(this.getMonthNum());
};


/** @return {string} A station name. */
sc.models.WeatherPrefs.prototype.getStation = function() {
  return sc.models.WeatherPrefs.getStation(this.get('city'));
};


/** @return {string} The month as a number starting from 1, not 0 index. */
sc.models.WeatherPrefs.prototype.getMonthNum = function() {
  return _.indexOf(sc.models.WeatherPrefsMonths, this.get('month')) + 1;
};



/** @inheritDoc */
sc.models.WeatherPrefs.prototype.getTemplateData = function() {
  var data = sc.Model.prototype.getTemplateData.call(this);
  data['station'] = this.getStation();
  return data;
};


/******************************************************************************/



/**
 * @extends {Backbone.Model}
 * @constructor
 */
sc.models.WeatherData = sc.Model.extend();


/**
 * @param {number} number A number to pad.
 * @return {string} A padded number.
 */
sc.models.WeatherData.padMonth = function(number) {
  return (number < 10 ? '0' : '') + number;
};


/** @inheritDoc */
sc.models.WeatherData.prototype.initialize = function(opt_data, opt_options) {
  sc.log('sc.models.WeatherData initialize');
  this.prefs = new sc.models.WeatherPrefs(
      sc.models.WeatherPrefs.getFromUrl());
  this.listenTo(this.prefs, 'change', this.fetch);
};



/** @inheritDoc */
sc.models.WeatherData.prototype.fetch = function(opt_options) {
  sc.log('sc.models.WeatherData fetch');

  sc.Model.prototype.fetch.call(this, {
    error: _.bind(function() {
      sc.log('Error in WeatherData fetch.');
      this.clear();
    }, this)
  });

};


/**
 * @return {string} An url.
 */
sc.models.WeatherData.prototype.url = function() {
  var monthAsString = sc.models.WeatherData.padMonth(this.prefs.getMonthNum());
  var url = sc.models.getServer() + '/wunderground/output/' +
      this.prefs.getStation() + '/' + this.prefs.get('year') + '/' +
      monthAsString + '/data.json';
  sc.log('sc.models.WeatherData url', url);
  return url;
};


/******************************************************************************/


/** @type {Array.<string>} */
sc.models.MobPrefsStates = ['CA'];


/**
 * @extends {Backbone.Model}
 * @constructor
 */
sc.models.MobPrefs = sc.Model.extend({
  defaults: {
    'state': sc.models.MobPrefsStates[0]
  }
});


/******************************************************************************/



/**
 * @extends {Backbone.Model}
 * @constructor
 */
sc.models.MobData = sc.Model.extend();


/** @inheritDoc */
sc.models.MobData.prototype.initialize = function(opt_data, opt_options) {
  sc.log('sc.models.MobData.initialize');
  this.prefs = new sc.models.MobPrefs();
  this.listenTo(this.prefs, 'change', this.fetch);
};


/** @inheritDoc */
sc.models.MobData.prototype.fetch = function(opt_options) {
  sc.log('sc.models.MobData.fetch');
  sc.Model.prototype.fetch.call(this, {
    error: _.bind(function() {
      sc.log('Error in MobData fetch.');
      this.clear();
    }, this)
  });
};


/**
 * @return {string} An url.
 */
sc.models.MobData.prototype.url = function() {
  var url = sc.models.getServer() + '/mushroomobserver/' +
      this.prefs.get('state') + '/data.json';
  return url;
};

