const express = require("express"),
      router = express.Router(),
      middlewareObj = require("../middleware/index")

router.get("/login",middlewareObj.getLogin)

module.exports = router;