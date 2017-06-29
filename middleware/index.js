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


middlewareObj.login = function (req, res) {
    passport.authenticate("local-login", {
        successRedirect: "/"
    })(req, res, function () {
        c.query("select * from user where email=:email",
            { email: req.body.email },
            function (err, foundUser) {
                if (err) {
                    console.log(err)
                } else {
                    if (!foundUser.length) {
                        console.log("Wrong username")
                    } else {
                        if (bcrypt.compareSync(req.body.password,foundUser[0].password)) {
                            console.log("correct")
                            req.logIn(req.body.email,function(err){
                                if(err){
                                    console.log(err)
                                    console.log("1")
                                }else{
                                    console.log("here")
                                    res.redirect("/")
                                }
                            })
                        } else {
                            console.log("Wrong")
                        }
                    }
                }
            })
    })
}
// middlewareObj.login = function (req, res) {
//     passport.authenticate('local-login', {
//         successRedirect: "/",
//         failureRedirect: "/",
//     },
//     function(err, user,info){
//     console.log(req.body)
//         c.query("select * from user where email=:email",{email:req.body.email},function(err,foundUser){
//             console.log(foundUser)
//         })
//     }
//     )
// }
middlewareObj.register = function (req, res) {
    passport.authenticate("local")(req, res, function () {
        console.log("auth")
        console.log(req.isAuthenticated())
        res.redirect("/");
    })
}

c.end()
module.exports = middlewareObj