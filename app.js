const express = require("express"),
    app = express(),
    client = require('mariasql'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    flash = require('connect-flash'),
    middlewareObj = require("./middleware/index"),
    async = require("async"),
    dbSchema = require('./middleware/dbSchema'),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    bcrypt = require("bcrypt-nodejs")

const c = new client({
    host: 'localhost',
    user: 'root',
    password: 'kunal',
    port: 3307,
    db: 'ddif'
})
app.use(require("express-session")({
    secret: "Secret text 1234",
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize())
app.use(passport.session())
app.set("view engine", "ejs")
app.use(express.static(__dirname + "/public"))
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(flash())
passport.serializeUser(function (user, done) {
    done(null, user.id);
    console.log("serialized")
})
passport.deserializeUser(function (id, done) {
    c.query("select * from user where email=:email", { email: id }, function (err, rows) {
        done(err, rows[0])
    })
})

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
},
    function (req, email, password, done) {
        console.log("register")
        c.query("select * from user where email= :email", { email: email }, function (err, rows) {
            console.log(rows)
            if (err) {
                return done(err)
            } else {
                if (rows.length) {
                    return done(null, false)
                } else {
                    var newUser = {}
                    newUser.email = email
                    newUser.password = password
                    var hash = bcrypt.hashSync(password)
                    c.query('insert into user (email, password) values (:email,:password)',
                        { email: newUser.email, password: hash },
                        function (err, rows) {
                            req.login(newUser, function (err) {
                                if (err) {
                                    console.log(err)
                                } else {
                                    return done(null, newUser)
                                }
                            })
                        })
                }
            }
        })
    }
))

// passport.use('local-login', new LocalStrategy({
//     usernameField: 'email',
//     passwordField: 'password',
//     passReqToCallback: true
// },
//     function (email, password, done) {
//         console.log("a")
//         // console.log(email)
//         c.query("select * from user where email=:email", { email: email }, function (err, foundUser) {
//             if (err) {
//                 console.log(err)
//                 // return done(err)
//             } else if (!foundUser.length) {
//                 console.log("No user found")
//                 // return done(null)
//             } else {
//                 console.log(foundUser)
//                 // If user found
//                 if (foundUser[0].password != password) {
//                     console.log("Wrong password")
//                     // return done(null, false)
//                 }
//                 return done(null, foundUser[0])
//             }
//         })
//     }
// ))

const indexRoutes = require("./routes/index"),
    productRoutes = require("./routes/products")

c.end()


app.use(indexRoutes)
app.use(productRoutes)
app.get("/", function (req, res) {
    res.send("Hello there")
    console.log(req.isAuthenticated())
})


app.listen("3001", function () {
    console.log("Server started")
})