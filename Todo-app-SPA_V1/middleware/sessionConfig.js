const session = require('express-session');
require('dotenv').config();
const mysqlStore = require('express-mysql-session');

const MySQLStore = mysqlStore(session);
const sessionStore = new MySQLStore({
    host: 'localhost',
    port: 3306,
    user: 'root',
    database:'auth_todo',
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