const jwt = require("jsonwebtoken"), Router = require("express").Router, router = new Router(), User = require("../models/users"), Cart = require("../models/carts"), Session = require("../models/sessions"), { SECRET_KEY } = require("../config/config"), ExpressError = require("../expressError"), { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");

router.get("/", ensureLoggedIn, async (req, res, next) => {
    try {
        const user = await User.get({ user_id: req.user.user_id });
        res.json({ user });

    } catch (err) {
        return next(err);
    }
})

router.get("/cart", ensureLoggedIn, async (req, res, next) => {
    try {
        const result = await Cart.get_items({ user_id: req.user.user_id });
        return res.json({ result });
    } catch (err) {
        return next(err);
    }
})

router.post("/cart", ensureLoggedIn, async (req, res, next) => {
    try {
        const added = await Cart.add_item({ user_id: req.user.user_id, product_id: req.body.product_id });
        return res.json({ added });
    } catch (err) {
        return next(err);
    }
})

router.delete("/cart", ensureLoggedIn, async (req, res, next) => {
    try {
        await Cart.remove_item({ user_id: req.user.user_id, product_id: req.body.product_id });
        return res.json({ message: "Deleted successfully." });
    } catch (err) {
        return next(err);
    }
})

module.exports = router;