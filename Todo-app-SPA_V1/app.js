const path = require('path');

const express = require('express');
const session = require('express-session');

const authRoutes = require('./routes/auth.routes');
const taskRoutes = require('./routes/task.routes');
const commentRoutes = require('./routes/comment.routes')
const createSession = require('./middleware/sessionConfig');
const errorHandler = require('./middleware/errorHandler');
const authCheckMiddleware = require('./middleware/authcheck')


const app = express();

app.use(express.static('views'));
app.use(express.static('images'));
app.use(express.static('scripts'))

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({extended: false}));
app.use(express.json());

const initSession = createSession();
app.use(session(initSession));
app.use(authCheckMiddleware);


app.use(authRoutes);
app.use(taskRoutes);
app.use(commentRoutes);


app.use(errorHandler);

app.listen(3000, () => {
    console.log("Server horcht auf Port 3000");    
});
