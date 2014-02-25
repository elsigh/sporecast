#!/usr/bin/env node

/**
 * @fileoverview This script copies the server/static/app.html to the expected
 * Cordova path www/index.html and modifies it in the process:
 *    - Adds a script tag for cordova.js
 *    - Changes absolute asset paths to be relative.
 *    - Changes document.ready to deviceready event.
 *    - Creates symlinks in www for static dirs js, css, and img.
 */

var fs = require('fs');
var path = require('path');

var child = require('child_process');

var pathToCordovaAssets = path.join('.', 'www');
var pathToCordovaIndex = path.join(pathToCordovaAssets, 'index.html');

var assetDirs = ['css', 'js', 'img'];


/**
 * Look ma, it's rm -rf.
 * @param {string} itemPath The path to the thing to rm.
 */
var deleteRecursiveSync = function(itemPath) {
  if (fs.existsSync(itemPath) &&
      fs.statSync(itemPath).isDirectory() &&
      !fs.lstatSync(itemPath).isSymbolicLink()) {
    fs.readdirSync(itemPath).forEach(function(childItemName) {
      deleteRecursiveSync(path.join(itemPath, childItemName));
    });
    fs.rmdirSync(itemPath);
  } else {
    fs.unlinkSync(itemPath);
  }
};

/**
 * Copies app.html from the server and fixes paths, renames to index.html
 */
var copyAndFixAppTemplate = function() {
  var pathServerTemplates = path.join('../server/templates');
  var serverAppIndex = path.join(pathServerTemplates, 'app.html');
  if (fs.existsSync(serverAppIndex)) {
    var str = fs.readFileSync(serverAppIndex, 'utf8');

    // Add cordova.js
    str = str.replace('</head>',
                      '  <script src="cordova.js"></script>\n  </head>');

    // Changes document.ready to deviceready event.
    str = str.replace(/\$\(document\)\.ready\(/,
        'document.addEventListener("deviceready", ');


    // Make absolute paths relative.
    assetDirs.forEach(function(dir) {
      var re = new RegExp('"/' + dir + '/', 'g');
      str = str.replace(re, '"' + dir + '/');
    });
    fs.writeFileSync(pathToCordovaIndex, str, 'utf8');
  }
};


/**
 * Makes symlinks for assets so there is one source of truth.
 */
var symlinkAssetDirectories = function() {
  // Clean up asset dirs and then make symlinks to our server dir.
  var pathServerStatic = path.join('../../server/static');  // relative to www/
  assetDirs.forEach(function(dir) {
    var pathCordovaAsset = path.join(pathToCordovaAssets, dir);
    //console.log('Nuking ', pathCordovaAsset);
    deleteRecursiveSync(pathCordovaAsset);

    var symLinkSrc = path.join(pathServerStatic, dir);
    //console.log('Symlinking ', symLinkSrc, '->', pathCordovaAsset);
    fs.symlinkSync(symLinkSrc, pathCordovaAsset);
  });
};

// Main routine ;0
copyAndFixAppTemplate();
symlinkAssetDirectories();
