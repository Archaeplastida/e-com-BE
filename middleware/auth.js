const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config/config");
const ExpressError = require("../expressError");
const Session = require("../models/sessions");

async function authenticateJWT(req, res, next) {
  try {
    const tokenFromBody = req.headers.authorization.split(' ')[1];
    //console.log(tokenFromBody) debug purposes
    const payload = jwt.verify(tokenFromBody, SECRET_KEY);
    if (await Session.verify({ user_id: payload.user_id })) req.user = payload; // create a current user
    ExpressError("Unauthorized", 401);
    return next();
  } catch (err) {
    return next();
  }
}

function ensureLoggedIn(req, res, next) {
  if (!req.user) {
    return next({ status: 401, message: "Unauthorized" });
  } else {
    return next();
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn
};
