const passport = require("passport"),
    client = require('mariasql'),
    bcrypt = require("bcrypt-nodejs")


const middlewareObj = {};

const c = new client({
    host: 'localhost',
    user: 'root',
    password: 'kunal',
    port: 3306,
    db: 'ddif'
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
        if (req.user.acc_type == "admin") {
            console.log("ADMIN")
            next()
        } else {
            console.log("ERROR! You're not admin")
            res.redirect("back")
        }
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

middlewareObj.orders = function (req, res){
    c.query("select * from orders join order_item ON orders.order_id = order_item.order_id", function(err, foundOrder){
        if(err){
            console.log(err)
        }else{
            res.render('orders/index',{orders:foundOrder})
            // console.log(items)
        }
    })
}
c.end()
module.exports = middlewareObj