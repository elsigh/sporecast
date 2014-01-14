describe('window.app', function() {
  var app = window['app'];


  it('should not be null or undefined', function() {
    expect(app).not.toBeNull();
    expect(typeof app).not.toBe('undefined');
  });

});
