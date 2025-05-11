const User = require('../model/user');

function getLogin(request, response) {
   const message = request.session.errorMessage;

    if(message) {
        request.session.errorMessage = null;
    }

    if(request.session.isAuth) {
        return response.redirect('/app');
     }
     response.render('auth/login', {message: message})
};


async function login(request, response) {
    
    const user = new User(request.body.email, request.body.password);
    request.session.isAuth = false;

    const existingUser = await user.userExists();
    
    if(existingUser.length === 0) {
        request.session.errorMessage = {
          message: 'Registriere dich bitte, dieser User ist nicht vorhanden'
        };

        return response.redirect("/login");
    
    }
    
    const hasMatchingPassword = await user.hasMatchingPassword();

    if(hasMatchingPassword) {

        request.session.isAuth = true;
        
        request.session.userId = existingUser[0].id_user;

    } else if(!hasMatchingPassword) {

        request.session.errorMessage = {
            message: 'Da ist etwas schief gelaufen, bitte erneut versuchen'
        }

    }
   
    return response.redirect("/login");
};

function getSignUp(request, response) {
    const message = request.session.errorMessage;
    if(message) {
        request.session.errorMessage = null;
        // console.log(message)
    }

    if(request.session.isAuth) {
       return response.redirect('/app');
    }
    response.render('auth/signup', { message: message });

};

async function signUp(request, response) {
    const user = new User(request.body.email, request.body.password);
    await user.signup(request, response);

};

function logout(request, response) {

    request.session.isAuth = false;
    request.session.csrfToken = null;
    response.locals.csrfToken  = request.session.csrfToken
    response.locals.isAuth = request.session.isAuth;
    // response.redirect('/home');
    response.json({message: 'Logout erfolgreich'});
   
//  Diese Lösung wäre besser, sauberer und eleganter:
    // request.session.destroy((err) => {
    //     // response.redirect('/home');
    //     // response.json();
    // }

    // );  
};

module.exports = {
    getLogin: getLogin,
    login: login,
    getSignUp: getSignUp,
    signUp: signUp,
    logout: logout
};