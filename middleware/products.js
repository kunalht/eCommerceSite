const client = require('mariasql')
const productMiddleware = {}
const c = new client({
    host: 'localhost',
    user: 'root',
    password: 'kunal',
    port: 3307,
    db: 'ddif'
})

productMiddleware.getAllProducts = function (req, res) {
    c.query("select * from products", function (err, products) {
        if (err) { console.log(err) }
        else {
            res.render("products/index", {products:products})
        }
    })
}

productMiddleware.getNewProductForm = function (req, res) {
    res.render("products/new")
}

productMiddleware.addNewProduct = function (req, res) {
    c.query("insert into products (name,price) values (:name,:price)", { name: req.body.name, price: req.body.price }, function (err, newlyCreated) {
        if (err) {
            console.log(err)
        } else {
            res.redirect("/")
        }
    })
}
c.end()

module.exports = productMiddleware