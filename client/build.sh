#!/bin/sh

yarn run build

rm -rf ../server/static/js
rm -rf ../server/static/css
rm -rf ../server/static/media

cp -r build/static/* ../server/static/
cp build/index.html ../server/templates/
cp build/asset-manifest.json ../server/static/
cp build/favicon.ico ../server/static/
cp build/manifest.json ../server/static/
cp build/service-worker.js ../server/static/

git add ../server/static/js/*
git add ../server/static/css/*
git add ../server/static/media/*
