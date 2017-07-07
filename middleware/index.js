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
    console.log(req.user)
    res.render("login")
}

middlewareObj.getRegister = function (req, res) {
    res.render("register")
}

middlewareObj.logout = function(req, res){
    req.logout()
    res.redirect("back")
}

c.end()
module.exports = middlewareObj