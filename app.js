const express = require("express"),
    app = express(),
    client = require('mariasql'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    flash = require('connect-flash'),
    middlewareObj = require("./middleware/index"),
    async = require("async"),
    dbSchema = require('./middleware/dbSchema')

const indexRoutes = require("./routes/index")
const c = new client({
    host: 'localhost',
    user: 'root',
    password: 'kunal',
    port: 3307,
    db: 'ddif'
})
// c.query('drop table items', function (err, rows) {
//     if (err)
//         throw err;
//     console.dir(rows);
// });

c.end()
app.use(indexRoutes)
app.set("view engine", "ejs")
app.use(express.static(__dirname + "/public"))
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(flash())
app.get("/", function (req, res) {
    res.send("Hello there")
})

app.get("/a", function (req, res) {
    res.send("A location")
})

app.listen("3000", function () {
    console.log("Server started")
})