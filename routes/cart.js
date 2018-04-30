const express = require("express"),
      router = express.Router(),
      middlewareObj = require("../middleware/index"),
      productMiddleware = require("../middleware/products"),
      cartMiddleware = require("../middleware/cart"),
      indexMiddleware = require("../middleware/index");

router.get('/cart/:id', indexMiddleware.checkIfLoggedIn ,cartMiddleware.addToCart)
router.get('/cart/d/:id',cartMiddleware.removeFromCart)
router.get('/cart', cartMiddleware.cart)

module.exports = router;