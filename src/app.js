require('dotenv').config();

const express = require('express');
const fileUpload = require('express-fileupload');
const logger = require('morgan');
const path = require('node:path');
const { auth } = require('express-openid-connect');
const { config: authConfig } = require('./lib/auth');

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

// logger
app.use(logger('dev'));

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload());

// auth & security
app.disable('x-powered-by');
app.use(auth(authConfig));
app.use((req, res, next) => {
    try {
        if (req.oidc.user) {
            req.user = req.oidc.user
        } else {
            req.user = null;
        }
    } catch (error) {
        req.user = null;
    }
    console.log(req.oidc.user)
    console.log(req.user)
    next();
});

// static files
app.use(express.static(path.join('node_modules', 'bootstrap', 'dist')));
app.use(express.static(path.join('public')));

// view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// routes
app.use('/', require('./routes/index'));

// 404 / error handler
app.use((req, res, next) => {
    res.status(404).send('404 Not Found');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});