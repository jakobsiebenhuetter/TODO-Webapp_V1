require('dotenv').config('/.env');

const db = require('mysql2/promise');

    const connection = db.createPool({
        host: process.env.HOST,
        user: process.env.USER,
        database: process.env.DATABASE,
        password: process.env.PASSWORD,
    });


module.exports = connection;




