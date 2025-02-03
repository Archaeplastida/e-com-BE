const jwt = require("jsonwebtoken"),
  Router = require("express").Router,
  router = new Router(),
  User = require("../models/users"),
  Session = require("../models/sessions"),
  { SECRET_KEY } = require("../config/config"),
  ExpressError = require("../expressError"),
  { ensureLoggedIn, authenticateJWT } = require("../middleware/auth"),
  validateSchema = require("../middleware/validateSchema"),
  registerSchema = require("../schemas/register-schema.json"),   
  loginSchema = require("../schemas/login-schema.json");       


router.post("/login", validateSchema(loginSchema), async (req, res, next) => {
  try {
    const { user_name, password } = req.body;
    let authenticateUser = await User.authenticate({ user_name, password });
    if (authenticateUser) {
      const token = jwt.sign(
        { user_name, user_id: authenticateUser },
        SECRET_KEY
      );
      await Session.create({ user_id: authenticateUser, token });
      return res.json({ token });
    } else {
      throw new ExpressError("Invalid username/password", 400);
    }
  } catch (err) {
    return next(err);
  }
});

router.post("/register", validateSchema(registerSchema), async (req, res, next) => {
  try {
    let { user_name } = await User.register(req.body);
    return res.json({
      message: `${user_name} has registered; you can now login.`,
    });
  } catch (err) {
    if (err.code === "23505") {
      return next(
        new ExpressError("Username already taken", 400)
      );
    }
    return next(err);
  }
});

router.get("/logout", ensureLoggedIn, authenticateJWT, async (req, res, next) => {
  try {
    await Session.deactivate({ user_id: req.user.user_id });
    return res.json({ message: "Logged out successfully." });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;