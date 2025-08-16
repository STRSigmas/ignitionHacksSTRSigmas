require("dotenv").config()
const fs = require('fs');
const path = require('path');


const fse = require('fs-extra');

if (fs.existsSync(path.join(__dirname, '../../docs'))) {
    fse.removeSync(path.join(__dirname, '../../docs'));
}

const srcDir = path.join(__dirname, '../../src');
const docsDir = path.join(__dirname, '../../docs');

fse.copySync(srcDir, docsDir, { overwrite: true });
const indexPath = path.join(docsDir, "index.html")
const index = fs.readFileSync(indexPath, 'utf8');
const replaced = index.replace(/GOOGLE_MAPS_API_KEY/g, process.env.GOOGLE_MAPS_API_KEY);
fs.writeFileSync(indexPath, replaced);