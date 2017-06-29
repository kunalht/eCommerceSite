const express = require("express"),
      router = express.Router(),
      middlewareObj = require("../middleware/index"),
      productMiddleware = require("../middleware/products")

router.get("/products", productMiddleware.getAllProducts)
router.get("/new",productMiddleware.getNewProductForm)
router.post("/products", productMiddleware.addNewProduct)

module.exports = router;