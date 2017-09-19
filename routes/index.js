const express = require("express"),
  router = express.Router(),
  middlewareObj = require("../middleware/index"),
  passport = require("passport")


router.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
})
  router.get("/" ,middlewareObj.homePage)

router.get("/login", middlewareObj.getLogin)
// router.post("/login", middlewareObj.login)
router.post('/login',
  passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/login'
  }));
router.post('/register',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/register'
  }));

router.get("/register", middlewareObj.getRegister)
// router.post("/register",middlewareObj.register)
router.get("/logout", middlewareObj.logout)

router.get('/profile/edit', middlewareObj.getProfile)

router.get('/login/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }))
// router.get('/login/facebook/return',
// passport.authenticate('facebook', { failureRedirect: '/login', session: true }),
// middlewareObj.loginFb)
router.get('/login/facebook/return',
  passport.authenticate('facebook', { failureRedirect: '/login', session: true }),
  function (req, res) {
    if (req.user.username != null) {
      res.redirect('back');
    } else {
      res.redirect("/")
    }
  })



module.exports = router;