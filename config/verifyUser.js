const jwt = require('jsonwebtoken');
const config = require ('./keys');

const verifyUser = (module.exports = (req) => {
  const authorization = req.headers.authorization.split(' ')[1];
  return jwt.verify(authorization, config.secret);
});
