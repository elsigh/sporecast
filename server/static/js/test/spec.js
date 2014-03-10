
// Stubs cordova so we can run this page on the web not as a
// cordova app.
cordova = {
  addConstructor: function() {},
  require: function() {},
  define: function() {}
};

describe('App initialization (window.app)', function() {
  var app = window['app'];

  it('should not be null or undefined', function() {
    expect(app).not.toBeNull();
    expect(typeof app).not.toBe('undefined');
  });

  it('should have models and views', function() {
    expect(typeof app.model).not.toBe('undefined');
    expect(typeof app.view).not.toBe('undefined');
  });

  it('should have weather data', function() {
    expect(typeof app.model.weatherData).not.toBe('undefined');
  });

  it('should have mushroomobserver data', function() {
    expect(typeof app.model.mobData).not.toBe('undefined');
  });

  it('should have photos data', function() {
    expect(typeof app.model.photosData).not.toBe('undefined');
  });
});
