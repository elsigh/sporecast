#!/usr/bin/env node

/**
 * This script copies the app.html file from our server to the Cordova
 * www folder and makes a few slight changes to its contents in the process:
 *    - It renames absolute asset paths to be relative.
 */
var fs = require('fs');
var path = require('path');

var child = require('child_process');

// Look, it's rm -rf
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

var pathCordovaAssets = path.join('.', 'www');
var pathCordovaIndex = path.join(pathCordovaAssets, 'index.html');

var assetDirs = ['css', 'js', 'img'];

// Clean up asset dirs and then make symlinks to our server dir.
var pathServerStatic = path.join('../../server/static');  // relative to www/
assetDirs.forEach(function(dir) {
  var pathCordovaAsset = path.join(pathCordovaAssets, dir);
  //console.log('Nuking ', pathCordovaAsset);
  deleteRecursiveSync(pathCordovaAsset);

  var symLinkSrc = path.join(pathServerStatic, dir);
  //console.log('Symlinking ', symLinkSrc, '->', pathCordovaAsset);
  fs.symlinkSync(symLinkSrc, pathCordovaAsset);
});

// Copies app.html from the server and fixes paths, renames to index.html
var pathServerTemplates = path.join('../server/templates');
var serverAppIndex = path.join(pathServerTemplates, 'app.html');
if (fs.existsSync(serverAppIndex)) {
  var str = fs.readFileSync(serverAppIndex, 'utf8');
  assetDirs.forEach(function(dir) {
    var re = new RegExp('"/' + dir + '/', 'g');
    str = str.replace(re, '"' + dir + '/');
  });
  fs.writeFileSync(pathCordovaIndex, str, 'utf8');
}

