const client = require('mysql'),
    session = require('express-session'),
    mysqlAuth = require('../config/mysqlAuth');

const cartMiddleware = {}
const c = client.createConnection({
    host: mysqlAuth.mysqlAuth.host,
    user: mysqlAuth.mysqlAuth.user,
    password: mysqlAuth.mysqlAuth.password,
    port: mysqlAuth.mysqlAuth.port,
    database: mysqlAuth.mysqlAuth.db
})

cartMiddleware.addToCart = function (req, res) {
        //check if item already exist with for loop
        c.query('SELECT * FROM cart WHERE user_id=:userid AND item_id=:itemid', {
                userid: req.user.id,
                itemid: req.params.id
            },
            function (err, items) {
                if (err) {
                    console.log(err)
                } else {
                    if (items.length > 0) {
                        // item_value = items[0].quantity
                        // item_value++
                        // //if it does increase the quantity
                        // c.query('UPDATE cart set quantity=:quantity where user_id=:userid AND item_id=:itemid', {
                        //         quantity: item_value,
                        //         userid: req.user.id,
                        //         itemid: req.params.id
                        //     },
                        //     function (err, items) {
                        //         if (err) {
                        //             console.log(err)
                        //         } else {
                        //         }
                        //     })
                    } else {
                        //else create new iteam at length+1 location
                        c.query('INSERT INTO CART(user_id,item_id) values(:userid,:itemid)', {
                                userid: req.user.id,
                                itemid: req.params.id
                            },
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
            res.redirect('/checkout')
}

cartMiddleware.cart = function (req, res) {
    if (req.isAuthenticated()) {
        c.query('select * from cart join products ON cart.item_id=products.id where user_id=:userId', {
            userId: req.user.id
        }, function (err, cartItems) {
            res.render('cart', {
                items: cartItems
            })
        })
    }
}

cartMiddleware.removeFromCart = function (req, res) {
    c.query('delete from cart where user_id=:userid AND item_id=:itemid', {
        userid: req.user.id,
        itemid: req.params.id
    }, function (err, itemRemoved) {
        if (err) {
            console.log(err)
        } else {
            res.redirect("/cart")
        }
    })
}


module.exports = cartMiddleware
