const express = require("express"),
  router = express.Router(),
  middlewareObj = require("../middleware/index")
  orderMiddleware = require("../middleware/orders"),

// router.use(express.static(__dirname + "/public"))


router.get('/order/new/:id', orderMiddleware.singleOrder)
router.post('/order/:id', orderMiddleware.orderPostSingle)
// router.get('/order/new/:id/add',orderMiddleware.singleOrderAddress)
router.get('/checkout',orderMiddleware.newOrder)
router.post('/order', orderMiddleware.postOrder)

//If it's an admin account
// List of all orders.
// Add way to delete account
router.get('/orders', middlewareObj.checkisAdmin, middlewareObj.orders)
module.exports = router;