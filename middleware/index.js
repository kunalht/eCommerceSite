const passport = require("passport"),
    client = require('mysql'),
    bcrypt = require("bcrypt-nodejs"),
    mysqlAuth = require('../config/mysqlAuth')



const middlewareObj = {};

const c = client.createConnection({
    host: mysqlAuth.mysqlAuth.host,
    user: mysqlAuth.mysqlAuth.user,
    password: mysqlAuth.mysqlAuth.password,
    port: mysqlAuth.mysqlAuth.port,
    database: mysqlAuth.mysqlAuth.db
})

middlewareObj.getLogin = function (req, res) {
    let notLoggedInError = res.locals.isLoggedInError;
    res.render("login",{notLoggedInError:notLoggedInError})
}

middlewareObj.getRegister = function (req, res) {
    res.render("register")
}

middlewareObj.logout = function (req, res) {
    req.logout()
    res.redirect("back")
}
middlewareObj.homePage = function (req, res) {
    res.redirect('/products')
}

middlewareObj.checkIfLoggedIn = (req, res, next) => {
    if (!req.user) {
        res.locals.isLoggedInError = true;
        res.redirect('/login');
    }else{
        console.log("ERHER")
    }
    next();
}

middlewareObj.checkisAdmin = function (req, res, next) {
    console.log(req.user)
    if (req.user) {
        if(req.user.isAdmin == 1){
            next();
        }else{
            res.redirect('back')
        }
        // if (req.user.acc_type == "admin") {
        //     console.log("ADMIN")
        //     next()
        // } else {
        //     console.log("ERROR! You're not admin")
        //     res.redirect("back")
        // }
    } else {
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


module.exports = middlewareObj