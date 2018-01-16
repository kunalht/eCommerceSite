const express = require("express"),
    app = express(),
    client = require('mariasql'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    flash = require('connect-flash'),
    middlewareObj = require("./middleware/index"),
    // async = require("async"),
    dbSchema = require('./middleware/dbSchema'),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    FacebookStrategy = require("passport-facebook"),
    bcrypt = require("bcrypt-nodejs"),
    session = require("express-session"),
    // configAuth = require('./config/auth'),
    mysqlAuth = require('./config/mysqlAuth')



const c = new client({
    host: mysqlAuth.mysqlAuth.host,
    user: mysqlAuth.mysqlAuth.user,
    password: mysqlAuth.mysqlAuth.password,
    port: mysqlAuth.mysqlAuth.port,
    db: mysqlAuth.mysqlAuth.db
})

app.use(require("express-session")({
    secret: "Secret text 1234",
    resave: true,
    saveUninitialized: false,
}));
app.use(passport.initialize())
app.use(passport.session())
app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(express.static(__dirname + "/public"))
app.use(express.static(__dirname + "/images"))
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(flash())
passport.serializeUser(function (user, done) {
    done(null, user);
})
passport.deserializeUser(function (user, done) {
    done(null, user);
});


passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
},
    function (req, email, password, done) {
        console.log("register")
        c.query("select * from user where email= :email", { email: email }, function (err, rows) {
            if (err) {
                return done(err)
            } else {
                if (rows.length) {
                    console.log("Already exist")
                    return done(null, false)
                } else {
                    var newUser = {}
                    newUser.email = email
                    newUser.password = password
                    var hash = bcrypt.hashSync(password)
                    c.query('insert into user (email, password,loginwith) values (:email,:password,"email")',
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

passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
},
    function (req, email, password, done) {
        console.log(password)
        c.query("select * from user where email=:email", { email: email }, function (err, foundUser) {
            if (err) {
                console.log(err)
                // return done(err)
            } else if (!foundUser.length) {
                console.log("No user found")
                return done(null, false)
                // return done(null)
            } else {
                bcrypt.compare(password, foundUser[0].password, function (err, res) {
                    if (res == false) {
                        console.log('wrong password')
                        return done(null, false)
                    } else {
                        req.login(foundUser[0], function (err) {
                            if (err) {
                                console.log(err)
                            }
                        })
                        return done(null, foundUser[0])
                    }

                })
            }
        })
    }
))
// passport.use(new FacebookStrategy({
//     clientID: configAuth.facebookAuth.clientID,
//     clientSecret: configAuth.facebookAuth.clientSecret,
//     callbackURL: configAuth.facebookAuth.callbackURL,
//     profileFields: ['id', 'displayName', 'name', 'email']
// }, function (accessToken, refreshToken, profile, cb) {
//     process.nextTick(function () {
//         c.query('select * from user where facebook_id=:pid', { pid: profile.id }, function (err, user) {            
//         // c.query('select * from user_fb where pid=:pid', { pid: profile.id }, function (err, user) {

//             if (err) {
//                 return cb(err)
//             } if (user.length > 0) {
//                 //Add items this way
//                 // user[0].test = "aa"
//                 return cb(null, user[0])
//             } else {
//                 console.log(profile)
//                 console.log(user.length)
//                 var newUser = {}
//                 newUser.pid = profile.id
//                 newUser.token = accessToken
//                 newUser.name = profile.name.givenName + ' ' + profile.name.familyName
//                 newUser.email = (profile.emails[0].value || '').toLowerCase()
//                 c.query('insert into user(email,fullname,facebook_id,loginwith) values(:email,:fullname,:pid,:loginwith)',
//                     { email: newUser.email, fullname: newUser.name, pid: newUser.pid, loginwith: "facebook" },
//                     function (err, addedUser) {
//                         if(err){
//                             console.log(err)
//                         }else{
//                             return cb(null, newUser)
//                         }
//                         // newUser.id = addedUser.info.insertId
//                         // c.query('insert into user_fb(pid,id,email,name,token) values(:pid,:id,:email,:name,:token)',
//                         //     { pid: newUser.pid, id:addedUser.info.insertId,email: newUser.email, name: newUser.name, token: newUser.token },
//                         //     function (err, rows) {
//                         //     })
//                     })
//                 // })
//             }
//         })
//     })
// }))
const indexRoutes = require("./routes/index"),
    productRoutes = require("./routes/products"),
    cartRoutes = require("./routes/cart"),
    orderRoutes = require("./routes/order"),
    adminRoutes = require("./routes/adminRoutes")

c.end()


app.use(indexRoutes)
app.use(productRoutes)
app.use(cartRoutes)
app.use(orderRoutes)
app.use(adminRoutes)



app.listen("3000", function () {
    console.log("Server started")
})