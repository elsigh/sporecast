/**
 * @type {Object}
 */
Offline.options = {
  checks: {
    image: {
      url: sc.models.getServer() + '/img/favicon.png'
    },
    active: 'image'
  }
};


// Super-wild-west-runtime-unit-testing.
if (window.location.search.indexOf('?test=1') !== -1) {

  window['app'] = new sc.App();

  document.write(
      '<link rel="stylesheet" href="/js/test/jasmine-1.3.1/jasmine.css">');
  var testFiles = [
    '/js/test/jasmine-1.3.1/jasmine.js',
    '/js/test/jasmine-1.3.1/jasmine-html.js',
    '/js/test/spec.js',
    '/js/test/jasmine-1.3.1/run.js'
  ];

  $.each(testFiles, function(i, src) {
    document.write('<scr' + 'ipt src="' + src + '"></sc' + 'ript>');
  });


// PhoneGap init
} else if (bone.ua.IS_CORDOVA) {
  document.addEventListener('deviceready', function() {
    window['app'] = new sc.App();
  });


// Initialize WebApp style.
} else {
  $(document).ready(function() {
    window['app'] = new sc.App();
  });
}
