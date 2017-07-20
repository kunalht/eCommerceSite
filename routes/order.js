const express = require("express"),
      router = express.Router(),
      orderMiddleware = require("../middleware/orders")

router.get('/order/new/:id',orderMiddleware.singleOrder)
router.post('/order/:id',orderMiddleware.orderPostSingle)
// router.get('/order/new/:id/add',orderMiddleware.singleOrderAddress)
router.get('/order/new',orderMiddleware.newOrder)
// router.get('/order/new/add',orderMiddleware.newOrderAddress)
// router.post('/order/new',orderMiddleware.postOrder)
module.exports = router;