const express = require("express"),
      router = express.Router(),
      orderMiddleware = require("../middleware/orders"),
      middlewareObj = require("../middleware/index")
      
router.get('/order/new/:id',orderMiddleware.singleOrder)
router.post('/order/:id',orderMiddleware.orderPostSingle)
// router.get('/order/new/:id/add',orderMiddleware.singleOrderAddress)
// router.get('/order/new',orderMiddleware.newOrder)
router.get('/order/new',function(req, res){
  res.render("orders/new.ejs")
})
router.post('/order',orderMiddleware.postOrder)

  //If it's an admin account
  // List of all orders.
  // Add way to delete account
  router.get('/orders',middlewareObj.checkisAdmin ,middlewareObj.orders)
module.exports = router;