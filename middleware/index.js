const passport = require("passport"),
    client = require('mariasql'),
    bcrypt = require("bcrypt-nodejs"),
    mysqlAuth = require('../config/mysqlAuth')
    


const middlewareObj = {};

const c = new client({
    host: mysqlAuth.mysqlAuth.host,
    user: mysqlAuth.mysqlAuth.user,
    password: mysqlAuth.mysqlAuth.password,
    port: mysqlAuth.mysqlAuth.port,
    db: mysqlAuth.mysqlAuth.db
})

middlewareObj.getLogin = function (req, res) {
    res.render("login")
}

middlewareObj.getRegister = function (req, res) {
    res.render("register")
}

middlewareObj.logout = function (req, res) {
    req.logout()
    res.redirect("back")
}
middlewareObj.homePage = function (req, res) {
    // if (req.user) {
    //     if (req.user.acc_type == "admin") {
    //         console.log("ADMIN")
    //     }

    // }
    res.render("home")
}

middlewareObj.checkisAdmin = function (req, res, next) {
    if (req.user) {
        next()
        // if (req.user.acc_type == "admin") {
        //     console.log("ADMIN")
        //     next()
        // } else {
        //     console.log("ERROR! You're not admin")
        //     res.redirect("back")
        // }
    } else {
        console.log("no admin")
        res.redirect("back")
    }
}
middlewareObj.getProfile = function (req, res) {
    // c.query("SELECT * FROM customers where ")
    res.render("profile")
}

middlewareObj.loginfb = function (req, res) {
    if (req.user.username != null) {
        res.redirect('back');
    } else {
        res.redirect("/username")
    }
}

c.end()
module.exports = middlewareObj