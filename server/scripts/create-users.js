const fs = require('fs');
const {Model, Tools} = require("../src/core");
const { v4: uuidv4 } = require('uuid');

const envFilePath = fs.realpathSync(`${__dirname}/../../data/.env`);
if (fs.existsSync(envFilePath)) {
    require('dotenv').config({path: envFilePath});
}

(async () => {
    const emails = process.env.ALLOWED_EMAILS.split(',');
    await Promise.all(emails.map(async (email) => {
        const jsonQuery = {
            $from: "users",
            $where: {email}
        };

        try {
            const model = await Model.getOne(jsonQuery);
            if (!model) {
                await Model.insert({
                    $table: "users",
                    $documents: {
                        publicId: uuidv4(),
                        email,
                        password: Tools.getHashedPassword("123456")
                    }
                });
            }
        } catch (e) {
            console.error(e);
        }
    }));
    process.exit(0);
})();