const Product = require("../models/products");

const jwt = require("jsonwebtoken"), Router = require("express").Router, router = new Router(), User = require("../models/users"), Session = require("../models/sessions"), { SECRET_KEY } = require("../config/config"), ExpressError = require("../expressError"), { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");

router.post("/create", ensureLoggedIn, async (req, res, next) => {
    try {
        let seller_id = req.user.user_id;
        const { product_name, product_description, price } = req.body;
        const result = await Product.create({ seller_id, product_name, product_description, price });
        return res.json({ result });
    } catch (err) {
        return next(err);
    }
})

router.get("/", ensureLoggedIn, async (req, res, next) => {
    try {
        const results = await Product.all()
        return res.json({ results });
    } catch (err) {
        return next(err);
    }
})

router.get("/:product_id", ensureLoggedIn, async (req, res, next) => {
    try {
        const product = await Product.byId({ product_id: req.params.product_id })
        return res.json({ product });
    } catch (err) {
        return next(err);
    }
})

router.patch("/:product_id", ensureLoggedIn, async (req, res, next) => {
    try {
        const { product_name, product_description, price } = req.body
        const seller_id = await Product.getSellerId({ product_id: req.params.product_id });
        let product;
        if (req.user.user_id === seller_id) product = await Product.update({ product_id: req.params.product_id, product_name, product_description, price })
        else throw new ExpressError("Unauthorized.", 401);
        return res.json({ product })
    } catch (err) {
        return next(err);
    }
})

router.delete("/:product_id", ensureLoggedIn, async (req, res, next) => {
    try {
        const seller_id = await Product.getSellerId({ product_id: req.params.product_id });
        let product_deleted;
        if (req.user.user_id === seller_id) product_deleted = await Product.delete({ product_id: req.params.product_id });
        else throw new ExpressError("Unauthorized.", 401);
        return res.json({ product_deleted });
    } catch (err) {
        return next(err);
    }
})

module.exports = router;