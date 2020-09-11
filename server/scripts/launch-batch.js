const fs = require('fs');

const envFilePath = fs.realpathSync(`${__dirname}/../../data/.env`);
if (fs.existsSync(envFilePath)) {
    require('dotenv').config({path: envFilePath});
}

const [batchName] = process.argv.slice(2);
const batch = require(fs.realpathSync(`${__dirname}/../src/batchs/${batchName}.js`));
(async () => {
    await batch();
    process.exit(0);
})();