const express = require("express"),
router = express.Router(),
middlewareObj = require("../middleware/index"),
adminMiddleware = require("../middleware/admin")

router.get('/admin/orders',middlewareObj.checkisAdmin,adminMiddleware.getAllOrders)
router.get('/admin/orders/:id',adminMiddleware.getOrderById)
// Categories
router.get('/admin/cat/new',adminMiddleware.newCategory)

router.post('/admin/newcat',adminMiddleware.postCategory)

module.exports = router;