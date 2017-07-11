const client = require('mariasql'),
    session = require('express-session')

const cartMiddleware = {}
const c = new client({
    host: 'localhost',
    user: 'root',
    password: 'kunal',
    port: 3307,
    db: 'ddif',
})


cartMiddleware.addToCart = function (req, res) {
    if (req.isAuthenticated()) {
        //check if item already exist with for loop
        c.query('SELECT * FROM CART WHERE user_id=:userid AND item_id=:itemid',
            { userid: req.user.ID, itemid: req.params.id },
            function (err, items) {
                if (err) {
                    console.log(err)
                } else {
                    if (items.length > 0) {
                        item_value = items[0].quantity
                        item_value++
                        //if it does increase the quantity
                        c.query('UPDATE cart set quantity=:quantity where user_id=:userid AND item_id=:itemid',
                            { quantity: item_value, userid: req.user.ID, itemid: req.params.id },
                            function (err, items) {
                                if (err) {
                                    console.log(err)
                                } else {
                                    console.log(items)
                                }
                            })
                        console.log(item_value)
                    } else {
                        //else create new iteam at length+1 location
                        c.query('INSERT INTO CART(user_id,item_id) values(:userid,:itemid)',
                            { userid: req.user.ID, itemid: req.params.id },
                            function (err, rows) {
                                if (err) {
                                    console.log(err)
                                } else {
                                    console.log(rows)
                                }
                            })
                    }
                }
            })
        console.log(req.user.ID)
    }
    res.redirect('/')
}

cartMiddleware.cart = function (req, res) {
    const sess = req.session
    if (req.isAuthenticated()) {
        console.log(req.user.ID)
    }
    res.render('cart', { items: sess })
}

cartMiddleware.removeFromCart= function(req, res){
}
c.end()

module.exports = cartMiddleware