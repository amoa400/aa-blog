var path = require('path');
var fs = require('fs');
var Loader = require('loader');

var viewsDir = path.join(process.cwd(), process.argv[2]);
var publicDir = path.join(process.cwd(), process.argv[3]);
var scaned = Loader.scanDir(viewsDir);
console.log("Scaned.");
console.log(scaned);

var justCombo = process.argv[4];
var minified = Loader.minify(publicDir, scaned, justCombo);
console.log(minified);
console.log("Compile static assets done.");

fs.writeFileSync(path.join(publicDir, 'assets.json'), JSON.stringify(Loader.map(minified)));
console.log("write assets.json done. assets.json: ");
console.log(fs.readFileSync(path.join(publicDir, 'assets.json'), 'utf-8'));
