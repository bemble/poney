const moment = require("moment");
const sha1 = require("sha1");

const DEFAULT_JWT_SECRET = `430021db4f1c5d9ea31f2784da7c5a4f435289340cf1332386f372afe95819a9
73629e5aa01e628eb910f63c699b1f714bb7dad9f355247c2f7680d196ceb3f8
0e0a8733587170996f5006891774f343c54f094759bffc35a78f9922f548faca
4a725025f9f9c09e366c8fecf3332e60b7e50e55b9036f380aba0c51d33a0a5f
beb7bc3a8190051d37a74dae6b94810b2ab8fc2106515227e8a5966d54707628
e56f51020fe6d3de537e49759cbb80ece693bfdb823f5adfbd53d595311f4a2f
9c006ebf757d5c366901faa2c697770272feb0f47e13551c82de07103d1524e4
54d38ac4bda07410ac13b627b90db409183baeb1bbe3676a61ce72d14623f96f
d2a22a21f62dc9a5eb7062a866f184c011d470dc4f65154e6596f8d6f8fa58a5
74a288b6a388fbf12b35cbe836022325ec942bb0636eb5a0966edde842ecc808`;

module.exports = {
    formatDate: (d) => {
        const m = typeof d === "number" ? moment.utc(d, 'X') : moment(d);
        return m.format("YYYY-MM-DD");
    },
    formatNumber: (n) => {
        return (Math.round(n * 100) / 100).toFixed(2);
    },
    getDateStr: (year, month, day) => {
        if (typeof year === "object") {
            month = year.month + 1;
            day = year.day;
            year = year.year;
        }
        return `${year}-${("" + month).padStart(2, "0")}-${("" + day).padStart(2, "0")}`;
    },
    getHashedPassword: (password) => {
        return sha1(`${password}${process.env.PASSWORD_SALT || "yenop"}`);
    },
    getJwtSecret: () => process.env.JWT_SECRET || DEFAULT_JWT_SECRET
};