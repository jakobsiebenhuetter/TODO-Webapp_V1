const session = require('express-session');
require('dotenv').config();
const mysqlStore = require('express-mysql-session');

const MySQLStore = mysqlStore(session);
const sessionStore = new MySQLStore({
    host: process.env.HOST,
    port: process.env.PORT,
    user: process.env.USER,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
});

function createSession() {
    return {
        secret: 'super-secret',
        resave: false,
        saveUninitialized: false, 
        store: sessionStore,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000
        }
    }
};

module.exports = createSession;