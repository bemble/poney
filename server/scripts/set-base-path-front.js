/*
    Because the front is generated without the right homepage flag
    (it's build while docker image is created, not when started),
    we need to replace it every htlm/css/js file with the right one.
*/
const fs = require('fs');
const glob = require('glob');

const envFilePath = fs.realpathSync(`${__dirname}/../../data/.env`);
if (fs.existsSync(envFilePath)) {
    require('dotenv').config({path: envFilePath});
}

const BUILD_DIR = fs.realpathSync(`${__dirname}/../../front/build`);
const BASE_PATH = process.env.BASE_PATH || "";
const PLACEHOLDER = require(`${BUILD_DIR}/../package`).homepage;

const files = glob.sync(`${BUILD_DIR}/**/*.{json,js,css,html}`);
console.log(`Replacing base path placeholder "${PLACEHOLDER}" by "${BASE_PATH}" in ${files.length} files...`);

// Saving origin files))
try {
    fs.accessSync(`${BUILD_DIR}/index.html.original`);
} catch (e) {
    files.forEach(file => fs.copyFileSync(file, `${file}.original`));
}

// Replace base path itself
files.forEach(file => {
    const content = fs.readFileSync(`${file}.original`, {encoding: 'utf8'}).replace(new RegExp(PLACEHOLDER, "g"), BASE_PATH);
    fs.writeFileSync(file, content, {encoding: 'utf8'});
    console.log(`\tProcessed: ${file}`);
});

console.log("Base path successfully set.");

/*
let index = fs.readFileSync('../front/build/index.html', {encoding: 'utf8'});
    // JS
    index = index.replace(/script src="\//g, "script src=\"./");
    // CSS
    index = index.replace(/href="\//g, "href=\"./");
    // base
    index = index.replace(/base href="[^"]+"/, `base href="${process.env.BASE_PATH}/"`);

    app.use(`${process.env.BASE_PATH}/index.html`, (req, res) => res.set('Content-Type', 'text/html').send(index));
    app.use(`${process.env.BASE_PATH}/`, express.static('../front/build'));
 */