const Router = require("express").Router,
  router = new Router(),
  User = require("../models/users"),
  Cart = require("../models/carts"),
  ExpressError = require("../expressError"),
  { ensureLoggedIn } = require("../middleware/auth"),
  validateSchema = require("../middleware/validateSchema");

const cartItemSchema = require('../schemas/cart-item-schema.json');


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

router.post("/cart", ensureLoggedIn, validateSchema(cartItemSchema), async (req, res, next) => {
    try {
        const added = await Cart.add_item({ user_id: req.user.user_id, product_id: req.body.product_id });
        if (!added) {
            throw new ExpressError("Product not found", 404);
        }
        return res.json({ added });
    } catch (err) {
        return next(err);
    }
})

router.delete("/cart", ensureLoggedIn, validateSchema(cartItemSchema), async (req, res, next) => {
    try {
        const deleted = await Cart.remove_item({ user_id: req.user.user_id, product_id: req.body.product_id });
        if (!deleted) {
            throw new ExpressError("Failed to remove item from cart. Product might not be in cart.", 400);
        }
        return res.json({ message: "Deleted successfully." });
    } catch (err) {
        return next(err);
    }
})

module.exports = router;