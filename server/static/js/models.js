


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


/** @inheritDoc */
sc.models.WeatherPrefs.prototype.initialize = function(opt_data, opt_options) {
  this.fetch();  // get from localStorage.
  this.listenTo(this, 'change', this.onChange_);
};


/** @private */
sc.models.WeatherPrefs.prototype.onChange_ = function() {
  sc.log('sc.models.WeatherPrefs onChange_', this.toJSON());
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
sc.models.WeatherData.prototype.getTemplateData = function() {
  var data = sc.Model.prototype.getTemplateData.call(this);
  if (data['datetime_utc']) {
    data['last_updated'] = sc.prettyDate(
        new Date(data['datetime_utc']).getTime());
  }
  return data;
};


/** @inheritDoc */
sc.models.WeatherData.prototype.fetch = function(opt_options) {
  sc.log('sc.models.WeatherData fetch');

  sc.Model.prototype.fetch.call(this, {
    error: _.bind(function(model, response, options) {
      sc.log('Error in WeatherData fetch.', response.status);
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



/******************************************************************************/


/**
 * @extends {Backbone.Model}
 * @constructor
 */
sc.models.PhotosPrefs = sc.Model.extend({
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
sc.models.Photo = sc.Model.extend();


/** @inheritDoc */
sc.models.Photo.prototype.initialize = function() {
  this.listenTo(this, 'change', this.onChange_);
};


/** @private */
sc.models.Photo.prototype.onChange_ = function() {
  sc.log('sc.models.Photo onChange_', this.toJSON());
  _.defer(_.bind(this.save, this));  // update localStorage
};


/******************************************************************************/



/**
 * @extends {Backbone.Model}
 * @constructor
 */
sc.models.PhotosData = sc.Collection.extend({
  localStorage: new Backbone.LocalStorage('photos-data'),
  model: sc.models.Photo
});


/** @inheritDoc */
sc.models.PhotosData.prototype.initialize = function(opt_data, opt_options) {
  sc.log('sc.models.PhotosData.initialize');
  this.prefs = new sc.models.PhotosPrefs();
  this.fetch();  // get from localStorage.
  sc.log('.. fetched length', this.length);
  this.listenTo(this, 'change', this.onChange_);
  this.listenTo(this, 'add', this.onAdd_);
};


/**
 * @param {Backbone.Model} model The photo model.
 * @private
 */
sc.models.PhotosData.prototype.onAdd_ = function(model) {
  sc.log('sc.models.PhotosData onAdd_', model);
  // TODO(lorin): This would be a great place to call the EXIF plugin to
  // strip the geo data, and then store it back with the photo model data.
};


/** @private */
sc.models.PhotosData.prototype.onChange_ = function() {
  sc.log('sc.models.PhotosData onChange_', this.toJSON());
};
