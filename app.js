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
    bcrypt = require("bcrypt-nodejs"),
    session = require("express-session"),
    sqlStore = require('express-mysql-session')(session)

const c = new client({
    host: 'localhost',
    user: 'root',
    password: 'kunal',
    port: 3307,
    db: 'ddif',
     createDatabaseTable: true,// Whether or not to create the sessions database table, if one does not already exist. 
    connectionLimit: 1,// Number of connections when creating a connection pool 
    schema: {
        tableName: 'session',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
})
var options = {
 host: 'localhost',
    user: 'root',
    password: 'kunal',
    port: 3307,
    database: 'ddif',
    createDatabaseTable: true,// Whether or not to create the sessions database table, if one does not already exist. 
    connectionLimit: 1,// Number of connections when creating a connection pool 
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
};
var sessionStore = new sqlStore(options);
app.use(require("express-session")({
    secret: "Secret text 1234",
    store: sessionStore,
    resave: true,
    saveUninitialized: false,
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
    done(null, user);
    console.log("serialized")
})
passport.deserializeUser(function (user, done) {
    done(null, user);
});

app.use(function (req, res, next) {
    res.locals.session = req.session
    next()
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
                console.log(foundUser)
                bcrypt.compare(password, foundUser[0].password, function (err, res) {
                    if (res == false) {
                        console.log('wrong password')
                        return done(null, false)
                    } else {
                        req.login(foundUser[0], function (err) {
                            if (err) {
                                console.log(err)
                            } else {
                                console.log("done")
                            }
                        })
                        return done(null, foundUser[0])
                    }

                })


            }
        })
    }
))

const indexRoutes = require("./routes/index"),
    productRoutes = require("./routes/products"),
    cartRoutes = require("./routes/cart")

c.end()


app.use(indexRoutes)
app.use(productRoutes)
app.use(cartRoutes)



app.listen("3000", function () {
    console.log("Server started")
})