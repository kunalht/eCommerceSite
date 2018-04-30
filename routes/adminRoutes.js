const express = require("express"),
router = express.Router(),
middlewareObj = require("../middleware/index"),
adminMiddleware = require("../middleware/admin")

router.get('/admin/orders',middlewareObj.checkisAdmin,adminMiddleware.getAllOrders)
router.get('/admin/orders/:id',middlewareObj.checkisAdmin, adminMiddleware.getOrderById)
// Categories
router.get('/admin/cat/new',middlewareObj.checkisAdmin, adminMiddleware.newCategory)

router.post('/admin/newcat',middlewareObj.checkisAdmin, adminMiddleware.postCategory)
router.get('/admin', middlewareObj.checkisAdmin ,adminMiddleware.getAdminHomePage)

module.exports = router;