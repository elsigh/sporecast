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
  return (bone.ua.IS_APP || bone.ua.IS_PROD_WEB_APP) && !bone.ua.isSimulator() ?
      sc.models.SERVER_PROD : sc.models.SERVER_LOCAL;
};


/******************************************************************************/



/**
 * @extends {Backbone.Model}
 * @constructor
 */
sc.models.App = Backbone.Model.extend();



/** @inheritDoc */
sc.models.App.prototype.initialize = function(opt_data, opt_options) {
  bone.log('sc.models.App.initialize');

  this.weatherData = new sc.models.WeatherData();
  this.mobData = new sc.models.MobData();
  this.photosData = new sc.models.PhotosData();
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
  },
  {
    'pws': 'KORASTOR4',
    'name': 'Astoria'
  },
  {
    'pws': 'KWACARSO3',
    'name': 'Carson'
  },
  {
    'pws': 'KCAKINGS6',
    'name': 'KingsCanyon'
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
sc.models.WeatherPrefs = bone.Model.extend({
  defaults: {
    'id': 'weather-prefs-model',
    'city': sc.models.WeatherPrefsCities[0]['name'],
    'month': sc.models.WeatherPrefsMonths[(new Date()).getMonth()],
    'year': (new Date()).getFullYear()
  },
  localStorage: new Backbone.LocalStorage('weather-prefs')
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
  return sc.models.WeatherPrefsCities[0]['pws'];  // Fallback
};


/**
 * @param {string} station A station name.
 * @return {string} A city.
 */
sc.models.WeatherPrefs.getCity = function(station) {
  bone.log('sc.models.WeatherPrefs.getCity', station);
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
  bone.log('sc.models.WeatherData getPrefsFromUrl', weatherPrefs);
  return weatherPrefs;
};


/** @inheritDoc */
sc.models.WeatherPrefs.prototype.initialize = function(opt_data, opt_options) {
  this.fetch();  // get from localStorage.
  this.listenTo(this, 'change', this.onChange_);
};


/** @private */
sc.models.WeatherPrefs.prototype.onChange_ = function() {
  bone.log('sc.models.WeatherPrefs onChange_', this.toJSON());
  _.defer(_.bind(this.save, this));  // update localStorage
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
  var data = bone.Model.prototype.getTemplateData.call(this);
  data['station'] = this.getStation();
  return data;
};


/******************************************************************************/



/**
 * @extends {Backbone.Model}
 * @constructor
 */
sc.models.WeatherData = bone.Model.extend();


/**
 * @param {number} number A number to pad.
 * @return {string} A padded number.
 */
sc.models.WeatherData.padMonth = function(number) {
  return (number < 10 ? '0' : '') + number;
};


/** @inheritDoc */
sc.models.WeatherData.prototype.initialize = function(opt_data, opt_options) {
  bone.log('sc.models.WeatherData initialize');
  this.prefs = new sc.models.WeatherPrefs(
      sc.models.WeatherPrefs.getFromUrl());
  this.listenTo(this.prefs, 'change', this.fetch);
};


/** @inheritDoc */
sc.models.WeatherData.prototype.getTemplateData = function() {
  var data = bone.Model.prototype.getTemplateData.call(this);
  if (data['datetime_utc']) {
    data['last_updated'] = bone.prettyDate(
        new Date(data['datetime_utc']).getTime());
  }
  return data;
};


/** @inheritDoc */
sc.models.WeatherData.prototype.fetch = function(opt_options) {
  bone.log('sc.models.WeatherData fetch');

  bone.Model.prototype.fetch.call(this, {
    error: _.bind(function(model, response, options) {
      bone.log('Error in WeatherData fetch.', response.status);
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
  bone.log('sc.models.WeatherData url', url);
  return url;
};


/******************************************************************************/


/** @type {Array.<string>} */
sc.models.MobPrefsStates = ['CA'];


/**
 * @extends {Backbone.Model}
 * @constructor
 */
sc.models.MobPrefs = bone.Model.extend({
  defaults: {
    'state': sc.models.MobPrefsStates[0]
  },
  localStorage: new Backbone.LocalStorage('mob-prefs')
});


/** @inheritDoc */
sc.models.MobPrefs.prototype.initialize = function() {
  this.fetch();
};


/******************************************************************************/



/**
 * @extends {Backbone.Model}
 * @constructor
 */
sc.models.MobData = bone.Model.extend();


/** @inheritDoc */
sc.models.MobData.prototype.initialize = function(opt_data, opt_options) {
  bone.log('sc.models.MobData.initialize');
  this.prefs = new sc.models.MobPrefs();
  this.listenTo(this.prefs, 'change', this.fetch);
};


/** @inheritDoc */
sc.models.MobData.prototype.fetch = function(opt_options) {
  bone.log('sc.models.MobData.fetch');
  bone.Model.prototype.fetch.call(this, {
    error: _.bind(function() {
      bone.log('Error in MobData fetch.');
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



/******************************************************************************/


/**
 * @extends {Backbone.Model}
 * @constructor
 */
sc.models.PhotosPrefs = bone.Model.extend({
  defaults: {
    'id': 'photos-prefs-model'
  },
  localStorage: new Backbone.LocalStorage('photos-prefs')
});



/******************************************************************************/


/**
 * @extends {Backbone.Model}
 * @constructor
 */
sc.models.Photo = bone.Model.extend();


/** @inheritDoc */
sc.models.Photo.prototype.initialize = function() {
  this.listenTo(this, 'change', this.onChange_);
};


/** @private */
sc.models.Photo.prototype.onChange_ = function() {
  bone.log('sc.models.Photo onChange_', this.toJSON());
  _.defer(_.bind(this.save, this));  // update localStorage
};


/******************************************************************************/



/**
 * @extends {Backbone.Model}
 * @constructor
 */
sc.models.PhotosData = bone.Collection.extend({
  localStorage: new Backbone.LocalStorage('photos-data'),
  model: sc.models.Photo
});


/** @inheritDoc */
sc.models.PhotosData.prototype.initialize = function(opt_data, opt_options) {
  bone.log('sc.models.PhotosData.initialize');
  this.prefs = new sc.models.PhotosPrefs();
  this.fetch();  // get from localStorage.
  bone.log('.. fetched length', this.length);
  this.listenTo(this, 'change', this.onChange_);
  this.listenTo(this, 'add', this.onAdd_);
};


/**
 * @param {Backbone.Model} model The photo model.
 * @private
 */
sc.models.PhotosData.prototype.onAdd_ = function(model) {
  bone.log('sc.models.PhotosData onAdd_', model);
  // TODO(lorin): This would be a great place to call the EXIF plugin to
  // strip the geo data, and then store it back with the photo model data.
};


/** @private */
sc.models.PhotosData.prototype.onChange_ = function() {
  bone.log('sc.models.PhotosData onChange_', this.toJSON());
};
