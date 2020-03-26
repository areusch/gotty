#!/bin/bash -e

cd "$(dirname $0)"

(cd js && npm install && `npm bin`/webpack)

mkdir -p bindata/static
cp resources/index.html bindata/static/index.html
cp resources/favicon.png bindata/static/favicon.png

mkdir -p bindata/static/js
cp js/dist/gotty-bundle.js bindata/static/js/gotty-bundle.js
cp js/dist/gotty-bundle.js.map bindata/static/js/gotty-bundle.js.map

mkdir -p bindata/static/js/src
cp -R js/src/ bindata/static/js/src

mkdir -p bindata/static/css
cp resources/index.css bindata/static/css/index.css
cp resources/xterm_customize.css bindata/static/css/xterm_customize.css
cp js/node_modules/xterm/css/xterm.css bindata/static/css/xterm.css
