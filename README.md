Sporecast
================

Check it out at **<a href="http://www.sporecast.net/" target="_blank">sporecast.net</a>**

Sporecast took the worst rainfall year on record in CA to come into being.
Every single mushroom season, I've wished I had a way to quickly look up
rainfall totals along the coast. The backend is robust enough to work with
weather stations anywhere, so if there's interest I'll add more datasets.

This app also serves as a demo for the SXSW 2014 talk: From WebApp to Phonegap.


Downloads & Dependencies
------------------------

**Python**

<http://python.org/download>


**NodeJS**

<http://nodejs.ord/download>


**NPM** (NodeJS Package Manager)

<http://npmjs.org/package/download>


**Google App Engine SDK**

<https://developers.google.com/appengine/downloads‎>


**Cordova/Phonegap**
```
sudo npm install -g cordova
```

***Mobile SDKs***

**Android**

<https://developer.android.com/sdk>

**iOS**

<https://developer.apple.com/technologies/ios>


Web App - Getting Started
--------------------------

To run the app in your browser as a web app, open the Google App Engine Launcher
and then:

```
File -> Add Existing Application

choose the sporceast/server dir.
```


Cordova - Getting Started (Android)
------------------------------------

Be sure that you have the Android SDK installed.
Be sure that you have the Phonegap/Cordova CLI installed.

```js
cd sporceast/client
cordova platform add android
cordova emulate android or cordova run android (if you have a device attached)
```


Cordova Hooks
-------------

You should be up and running now!

[Read DevGirl's Intro to Hooks](http://devgirl.org/2013/11/12/three-hooks-your-cordovaphonegap-project-needs)

Significantly, we are using some hook scripts to map our web app resources
into the directories that cordova expects to contain our content. That way,
our web app remains the source of truth, and the hooks serve as a build system
for our Cordova app.

You should read these scripts:

[client/.cordova/hooks/after_platform_add/001_install_plugins.js](client/.cordova/hooks/after_platform_add/001_install_plugins.js)

[client/.cordova/hooks/before_prepare/001_index.js](client/.cordova/hooks/before_prepare/001_index.js)

[client/.cordova/hooks/after_prepare/001_splash_and_icons.js](client/.cordova/hooks/after_prepare/001_splash_and_icons.js)



Cordova - TODO
------------------------------------

Show off using the camera plugin to take and store photos, with an option to
strip EXIF geotags but still store and associate geolocation.

Show off HTML5 offline (appcache) so that data persists after it's fetched.

More aw3some.
