const passport = require("passport"),
    client = require('mariasql'),
    bcrypt = require("bcrypt-nodejs")


const middlewareObj = {};

const c = new client({
    host: 'localhost',
    user: 'root',
    password: 'kunal',
    port: 3307,
    db: 'ddif'
})

middlewareObj.getLogin = function (req, res) {
    res.render("login")
}

middlewareObj.getRegister = function (req, res) {
    res.render("register")
}

middlewareObj.logout = function(req, res){
    req.logout()
    res.redirect("back")
}
middlewareObj.homePage = function(req, res){
    res.render("home")
    console.log(req.user)
}

middlewareObj.getProfile = function(req , res){
    // c.query("SELECT * FROM customers where ")
    res.render("profile")
}

middlewareObj.loginfb = function(req, res){
    if (req.user.username != null) {
            res.redirect('back');
        } else {
            res.redirect("/username")
        }
}
c.end()
module.exports = middlewareObj