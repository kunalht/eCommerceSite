const client = require('mariasql'),
    session = require('express-session')

const cartMiddleware = {}
const c = new client({
    host: 'localhost',
    user: 'root',
    password: 'kunal',
    port: 3306,
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
                                    // console.log(items)
                                }
                            })
                    } else {
                        //else create new iteam at length+1 location
                        console.log(req.user.ID)
                        c.query('INSERT INTO CART(user_id,item_id) values(:userid,:itemid)',
                            { userid: req.user.ID, itemid: req.params.id },
                            function (err, rows) {
                                if (err) {
                                    console.log(err)
                                } else {
                                    // console.log(rows)
                                }
                            })
                    }
                }
            })
    }
    res.redirect('/')
}

cartMiddleware.cart = function (req, res) {
    if (req.isAuthenticated()) {
        c.query('select * from cart join products ON cart.item_id=products.id where user_id=:userId',
            { userId: req.user.ID }, function (err, cartItems) {
                console.log(cartItems)
                res.render('cart',{items:cartItems} )
            })
    }
}

cartMiddleware.removeFromCart = function (req, res) {
    c.query('delete from cart where user_id=:userid AND item_id=:itemid',
    {userid:req.user.ID,itemid:req.params.id},function(err,itemRemoved){
        if(err){
            console.log(err)
        }else{
            res.redirect("/cart")
        }
    })
    console.log(req.params.id)
}
c.end()

module.exports = cartMiddleware