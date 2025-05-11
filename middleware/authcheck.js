function authenticationCheck(request, response, next) {
    // Cache wird nicht verwendet, durch zurück Button im Browser kommt man nicht mehr auf die Seiten zurück wo man Sessions zur Authentifizierung gebraucht hat
    response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');

    const isAuth = request.session.isAuth
    if(!isAuth) {
        console.log(request.session.isAuth)
        return next();
    }
    response.locals.isAuth = request.session.isAuth;
    next();
};

module.exports = authenticationCheck;