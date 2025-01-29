const jwt = require("jsonwebtoken"),
  Router = require("express").Router,
  router = new Router(),
  User = require("../models/users"),
  Session = require("../models/sessions"),
  { SECRET_KEY } = require("../config/config"),
  ExpressError = require("../expressError"),
  { ensureLoggedIn } = require("../middleware/auth");

router.post("/login", async (req, res, next) => {
  try {
    const { user_name, password } = req.body;

    if (!user_name || !password)
      throw new ExpressError("Missing information", 400);

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

router.post("/register", async (req, res, next) => {
  try {
    if (
      !req.body.user_name ||
      !req.body.password ||
      !req.body.first_name ||
      !req.body.last_name ||
      !req.body.email
    ) {
      throw new ExpressError("Missing required fields", 400);
    }
<<<<<<< HEAD
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

router.get("/logout", ensureLoggedIn, async (req, res, next) => {
  try {
    let user_id = req.user.user_id;
    await Session.deactivate({ user_id });
    return res.json({ message: "Logged out successfully." });
  } catch (err) {
    return next(err);
  }
});
=======
})

router.get("/logout", ensureLoggedIn, async (req, res, next) => {
    try {
        let user_id = req.user.user_id;
        Session.deactivate({ user_id });
        return res.json({ message: "Logged out successfully." });
    } catch (err) {
        return next(err);
    }
})
>>>>>>> c70d69a9e3f690bc8c610198f394618121745a59

module.exports = router;