const crypto = require('crypto');
require('dotenv').config();
// wurde verändert, um den Token zu generieren
function generateCsrfToken(sessionId) {
    return crypto.createHmac('sha256', process.env.CSRF_SECRET).update(sessionId).digest('hex');
};

function csrfProtection(request, response, next) {
    const sessionId = request.session.id || crypto.randomBytes(16).toString('hex')

request.session.csrfToken = generateCsrfToken(sessionId)
response.locals.csrfToken = request.session.csrfToken;
console.log(response.locals)


  // CSRF-Token bei POST, PUT, DELETE validieren
  if (["POST", "PUT", "DELETE"].includes(request.method)) {
    const token = request.body.csrfToken || request.query.csrfToken;

    if (!token || token !== request.session.csrfToken) {
      return response.status(403).send("Ungültiges CSRF-Token");
    }
  }

  next();
};

module.exports = csrfProtection;

