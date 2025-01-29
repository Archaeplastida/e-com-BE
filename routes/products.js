const Product = require("../models/products");

const Review  = require("../models/reviews");

const Router = require("express").Router, router = new Router(), ExpressError = require("../expressError"), { ensureLoggedIn } = require("../middleware/auth");

router.post("/create", ensureLoggedIn, async (req, res, next) => {
    try {
        let seller_id = req.user.user_id;
        const { product_name, product_description, price, tags, images} = req.body;
        const created = await Product.create({ seller_id, product_name, product_description, price, tags, images });
        return res.json({ created });
    } catch (err) {
        return next(err);
    }
})

router.get("/", ensureLoggedIn, async (req, res, next) => {
    try {
        const results = await Product.all();
        return res.json({ results });
    } catch (err) {
        return next(err);
    }
});

router.get("/:product_id", ensureLoggedIn, async (req, res, next) => {
    try {
        const product = await Product.byId({
            product_id: req.params.product_id,
        });
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        return res.json({ product });
    } catch (err) {
        return next(err);
    }
});

router.patch("/:product_id", ensureLoggedIn, async (req, res, next) => {
    try {
        const { product_name, product_description, price, tags } = req.body;
        const product_id = req.params.product_id;
        const seller_id = await Product.getSellerId({ product_id });

        if (seller_id === null) {
            return res.status(404).json({ error: "Product not found" });
        }

        let product;
        if (req.user.user_id === seller_id) {
            product = await Product.update({
                product_id,
                product_name,
                product_description,
                price,
                tags,
            });
        } else {
            throw new ExpressError("Unauthorized.", 401);
        }

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        return res.json({ product });
    } catch (err) {
        return next(err);
    }
});

router.delete("/:product_id", ensureLoggedIn, async (req, res, next) => {
    try {
        const product_id = req.params.product_id;
        const seller_id = await Product.getSellerId({ product_id });

        if (seller_id === null) {
            return res.status(404).json({ error: "Product not found" });
        }

        let product_deleted;
        if (req.user.user_id === seller_id) {
            product_deleted = await Product.delete({ product_id });
        } else {
            throw new ExpressError("Unauthorized.", 401);
        }
        return res.json({ product_deleted });
    } catch (err) {
        return next(err);
    }
});

router.get("/tag/:tag_id", ensureLoggedIn, async (req, res, next) => {
    try {
        const products = await Product.byTagId({ tag_id: req.params.tag_id });

        return res.json({ products });
    } catch (err) {
        return next(err);
    }
});

router.post("/:product_id/rate", ensureLoggedIn, async (req, res, next) => {
    try {
        const reviews = await Product.getProductReviews(req.params.product_id);
        for(let i of reviews) {
            if(i.user_id === req.user.user_id) throw new ExpressError("ONE review per person", 400);
        }
        let {rating, review_text} = req.body;
        review_text = review_text === null ? "" : review_text;
        const user_id = req.user.user_id;
        const product_id = req.params.product_id;
        const review = await Review.create({user_id, product_id, rating, review_text})
        return res.json({ review });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;