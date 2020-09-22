import express = require('express');
import fs = require('fs');
import path = require('path');
var rollup = require('rollup-endpoint');

const app = express();
const port = process.env.PORT || 8081;

app.get(
  '/__build__/Dropbox-sdk.min.js',
  rollup.serve({
    entry: path.resolve(__dirname, '../../dist/Dropbox-sdk.js'),
  }),
);

fs.readdirSync(__dirname).forEach(function (file) {
  if (fs.statSync(path.join(__dirname, file)).isDirectory()) {
    app.use(`/${file}`, express.static(path.resolve(__dirname, file)));
  }
});

app.use('/__dist__', express.static(path.resolve(__dirname, '../../dist')));
app.use('/', express.static(__dirname));


app.listen(port, function () {
  console.log("Express server listening on port " + port );
});
