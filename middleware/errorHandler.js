function errorHandler(request, response, next) {
    response.status(404).render('shared/404');
};

module.exports = errorHandler;