'use strict';

var jwt = require('jsonwebtoken');
var jwtSecret = process.env.jwtSecret;
var authenticateToken = function authenticateToken(req, res, next) {
  var authHeader = req.headers['authorization'];
  var token = authHeader && authHeader.split(' ')[1];
  if (token == null) {
    return res.sendStatus(401); // Unauthorized
  }
  jwt.verify(token, jwtSecret, function (err, user) {
    if (err) {
      return res.sendStatus(403); // Forbidden
    }
    req.user = user; // Attach the decoded user information to the request object
    next();
  });
};

module.exports = authenticateToken;