/**
 * validation.js für die Validierung der Eingaben
 * 
 */
function validateSignUp (email, password) {

    let validateMessage = {
        continue: null,
        message: ''
    }
    if(email.trim() === '' || password.trim() === '') {
        validateMessage.continue = false;
        validateMessage.message = 'Bei der Registrierung ist etwas schief gelaufen, bitte veruche es erneut';
        return validateMessage;
        
    } else if (!email.includes('@')) {
       validateMessage.continue = false;
       validateMessage.message = 'Die E-mail Adresse muss @-Zeichen beinhalten';
       return validateMessage;

     } else if (password.trim().length < 8) {
        validateMessage.continue = false;
        validateMessage.message = 'Das Passwort muss mindestens 8 Zeichen lang sein';
        return validateMessage;
    } else {
        validateMessage.continue = true;
        validateMessage.message = '';
        return validateMessage;
    }
}
// min-Passwortlengt = 8; checking if character and numbers
// Email adress with one dot after @
module.exports = validateSignUp;