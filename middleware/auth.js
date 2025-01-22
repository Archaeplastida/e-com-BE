const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config/config");
const ExpressError = require("../expressError");
const Session = require("../models/sessions");

async function authenticateJWT(req, res, next) {
  try {
    const tokenFromBody = req.headers.authorization
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

function ensureCorrectUser(req, res, next) {
  try {
    if (req.user.username === req.params.username) {
      return next();
    } else {
      return next({ status: 401, message: "Unauthorized" });
    }
  } catch (err) {
    return next({ status: 401, message: "Unauthorized" });
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser
};
