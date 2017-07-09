const client = require('mariasql'),
    session = require('express-session'),
    sqlStore = require('express-mysql-session')
const cartMiddleware = {}
const c = new client({
    host: 'localhost',
    user: 'root',
    password: 'kunal',
    port: 3307,
    db: 'ddif',
})
    

cartMiddleware.addToCart = function (req, res) {
    if (!req.session.cart) {
        req.session.cart = {}
    }
    req.session.cart = req.params.id
    //check if item already exist with for loop
    //if it does increase the quantity
    //else create new iteam at length+1 location

    console.log(req.session)
    console.log(req.sessionID)
    console.log(req.params.id)
    // req.session.cart.id  = req.params.id
    res.redirect('/')
}

cartMiddleware.clear = function (req, res) {
    req.session.destroy(function (err) {
        // cannot access session here
        if (err) {
            console.log(err)
        }
    })
    res.redirect('back')

}

cartMiddleware.cart = function(req, res){
    const sess = req.session
    console.log(sess)
    console.log(req.sessionID)
    res.render('cart', {items : sess})
}
c.end()

module.exports = cartMiddleware