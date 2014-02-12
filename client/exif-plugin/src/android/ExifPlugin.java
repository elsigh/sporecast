package com.elsigh.exif;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.media.ExifInterface;
import android.util.Log;
import android.widget.Toast;

import java.io.IOException;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;


public class ExifPlugin extends CordovaPlugin {
	private static final String TAG = ExifPlugin.class.getSimpleName();

	private ExifInterface exifInterface = null;


	@Override
	public boolean execute(String action, JSONArray args, CallbackContext callbackContext) {
		Log.d(TAG, "execute w/ " + action + " args: " + args);

		String filename = "";
		try {
			filename = args.getString(0);
		} catch (JSONException e) {
			e.printStackTrace();
			return false;
		}

		try {
			exifInterface = new ExifInterface(filename);
		} catch (IOException e) {
			e.printStackTrace();
			return false;
		}

		// Read the gps info.
		String lat = exifInterface.getAttribute(ExifInterface.TAG_GPS_LATITUDE);
		String lon = exifInterface.getAttribute(ExifInterface.TAG_GPS_LONGITUDE);
		String response = lat + "," + lon;

		// Nuke the gps info. Photo is now safe to share with mushroom nerds.
		/*
		exifInterface.setAttribute(ExifInterface.TAG_GPS_LATITUDE, "");
		exifInterface.setAttribute(ExifInterface.TAG_GPS_LONGITUDE, "");

		try {
			exifInterface.saveAttributes();
		} catch (IOException e) {
			e.printStackTrace();
			return false;
		}
		*/

		callbackContext.success(response);
		return true;
	}

}
