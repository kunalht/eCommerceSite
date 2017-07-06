const express = require("express"),
      router = express.Router(),
      middlewareObj = require("../middleware/index")

router.get("/login",middlewareObj.getLogin)
router.post("/login", middlewareObj.login)
router.get("/register",middlewareObj.getRegister)
router.post("/register",middlewareObj.register)
router.get("/logout", middlewareObj.logout)

module.exports = router;