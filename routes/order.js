const express = require("express"),
  router = express.Router(),
  middlewareObj = require("../middleware/index")
  orderMiddleware = require("../middleware/orders"),

// router.use(express.static(__dirname + "/public"))


router.get('/order/new/:id', orderMiddleware.singleOrder)
router.post('/order', orderMiddleware.postOrder)
router.post('/order/:id', orderMiddleware.orderPostSingle)
// router.get('/order/new/:id/add',orderMiddleware.singleOrderAddress)
router.get('/checkout',orderMiddleware.newOrder)
router.get('/order/status/:id/:status', orderMiddleware.changeOrderStatus)
router.get('/order/paypal/send',orderMiddleware.paypalTest)
router.get('/order_success',orderMiddleware.successOrder)
router.get('/order_cancel',orderMiddleware.cancelOrder)
router.get('/success',orderMiddleware.successRedirect)

//If it's an admin account
// List of all orders.
// Add way to delete account
module.exports = router;