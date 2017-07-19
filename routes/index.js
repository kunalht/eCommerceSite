const express = require("express"),
      router = express.Router(),
      middlewareObj = require("../middleware/index"),
      passport = require("passport")


router.get("/", middlewareObj.homePage)

router.get("/login",middlewareObj.getLogin)
// router.post("/login", middlewareObj.login)
router.post('/login',
  passport.authenticate('local-login', { successRedirect: '/',
                                   failureRedirect: '/login' }));
router.post('/register',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/register' }));

router.get("/register",middlewareObj.getRegister)
// router.post("/register",middlewareObj.register)
router.get("/logout", middlewareObj.logout)

router.get('/profile/edit',middlewareObj.getProfile)

module.exports = router;