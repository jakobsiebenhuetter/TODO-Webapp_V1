const bcrypt = require("bcrypt");

const db = require("../data/mysql/database");
const validateUserInput = require("../util/validation");

class User {
  constructor(email, password) {
    this.email = email;
    this.password = password;
  };

 async userExists() {
    let userExists;
    try {
      [userExists] = await db.query("SELECT * FROM user WHERE email = ?", [this.email]);
    } catch (error) {
      console.log(error);
    };

    return userExists;
  };

  async signup(request, response) {

    let userAlreadyExists = await this.userExists();
 
   
    if (userAlreadyExists.length > 0) {
      request.session.errorMessage = {
        message: "Die Email-Adresse ist nicht verfügbar, versuche es bitte noch einmal mit einer anderen Adresse."
      };

      return response.redirect("/signup");
    };

    const userInputValidation = validateUserInput(this.email, this.password);

    if (!userInputValidation.continue) {
      request.session.errorMessage = {
        message: userInputValidation.message
      };

      return response.redirect("/signup");
    };

    let hashedPassword;
    try {

      hashedPassword = await bcrypt.hash(this.password, 12);
    } catch (error) {
      console.log(error);
    };
   
    try {
     await db.query("INSERT INTO user (email, password) VALUES (?, ?)", [this.email, hashedPassword]);
    } catch (error) {
      console.log(error);
    };
    console.log("Signup erfolgreich");
    request.session.errorMessage = null;
    return response.redirect("/login");
  };
 

  async hasMatchingPassword() {
    const user = await this.userExists();

    if(user.length < 1) {
      return
    };
    const passwordMatch = await bcrypt.compare(this.password, user[0].password);
    return passwordMatch;
  };
};
module.exports = User;
