Sporecast
================

http://mushroomforecast.appspot.com/app

Sporecast is an app that took the worst rainfall year on record to come into being.
Every single year, come mushroom season, I wish I had a way to quickly look up
rainfall totals in a simple way for weather stations along the coast.

This app also serves as a demo for a talk about what's involved to take a web app
to the world of Cordova/Phonegap.


Web App - Getting Started
--------------------------

To run the app in your browser as a web app, download the Google App Engine SDK
and then

```
File -> Add Existing Application

and choose the sporceast/server dir.
```


Cordova - Getting Started (Android)
------------------------------------

Be sure that you have the Android SDK installed.
Be sure that you have the Phonegap/Cordova CLI installed.

```js
cd sporceast/client
cordova platform add android
cordova emulate android
```

You should be up and running!

Significantly, we are using two nodejs hook scripts to map our web app resources
into the directories that cordova expects to contain our content.

You should read:
```js
.cordova/hooks/before_prepare/001_index.js
.cordova/hooks/after_prepare/splash_and_icons.js
```


Cordova - TODO
------------------------------------

Show off using the camera plugin to take and store photos, with an option to
strip EXIF geotags but still store and associate geolocation.

Show off HTML5 offline (appcache) so that data persists after it's fetched.

More aw3some.
