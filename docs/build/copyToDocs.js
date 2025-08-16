require("dotenv").config()
const fs = require('fs');
const path = require('path');
const index = fs.readFileSync('src/index.html', 'utf8');
const replaced = index.replace('GOOGLE_MAPS_API_KEY', process.env.GOOGLE_MAPS_API_KEY);

const fse = require('fs-extra');

if (fs.existsSync(path.join(__dirname, '../../docs'))) {
    fse.removeSync(path.join(__dirname, '../../docs'));
}

const srcDir = path.join(__dirname, '../../src');
const docsDir = path.join(__dirname, '../../docs');

fse.copySync(srcDir, docsDir, { overwrite: true });