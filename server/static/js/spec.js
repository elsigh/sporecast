
// Stubs cordova so we can run this page on the web not as a
// cordova app.
cordova = {
  addConstructor: function() {},
  require: function() {},
  define: function() {}
};

describe('window.app', function() {
  var app = window['app'];


  it('should not be null or undefined', function() {
    expect(app).not.toBeNull();
    expect(typeof app).not.toBe('undefined');
  });

});
