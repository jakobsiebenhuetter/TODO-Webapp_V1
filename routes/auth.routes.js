const routes = require('express');

const csrfProtection = require('../middleware/csrfprotection');

const authController = require('../controller/auth.controller')

const router = routes.Router();

router.get('/', csrfProtection, (request, response) => {
     
    response.render('index')
});

router.get('/home', csrfProtection, (request, response) => {
    request.session.errorMessage = '';
    response.render('index')
});

router.get('/signup', csrfProtection,  authController.getSignUp)

router.post('/signup', csrfProtection, authController.signUp)

router.get('/login', csrfProtection,  authController.getLogin);

router.post('/login', csrfProtection,  authController.login);

router.post('/logout', csrfProtection, authController.logout);



module.exports = router;