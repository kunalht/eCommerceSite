const client = require('mariasql'),
    mysqlAuth = require('../config/mysqlAuth'),
    paypalAuth = require('../config/paypal'),
    paypal = require('paypal-rest-sdk');

const orderMiddleware = {}
const c = new client({
    host: mysqlAuth.mysqlAuth.host,
    user: mysqlAuth.mysqlAuth.user,
    password: mysqlAuth.mysqlAuth.password,
    port: mysqlAuth.mysqlAuth.port,
    db: mysqlAuth.mysqlAuth.db
})

paypal.configure({
    'mode': 'sandbox',
    'client_id': paypalAuth.paypal.client_id,
    'client_secret': paypalAuth.paypal.client_secret
});
orderMiddleware.singleOrder = function (req, res) {
    //If query has item in link
    // SHow that in cart at checkout time
    //else show cart items
    //SHOW address and customer details
    //Quantity
    if (req.query.q) {
        var quantity = req.query.q
    } else {
        var quantity = 1
    }
    c.query('select * from products where id=:id', {
            id: req.params.id
        },
        function (err, foundProduct) {
            if (err) {

            } else {
                //address find
                c.query('select * from user_addr where user_id=:id', {
                        id: req.user.ID
                    },
                    function (err, foundAddress) {
                        if (err) {
                            console.log(err)
                        } else {
                            //Show all addresses in the page
                            res.render("orders/newSingle", {
                                foundProduct: foundProduct,
                                foundAddress: foundAddress,
                                quantity: quantity
                            })
                        }
                    }
                )
            }
        })
}

orderMiddleware.orderPostSingle = function (req, res) {
    // get quantity, item_id and address id
    //calculate total price and create new order
    // Get product info by id
    c.query('select * from products where id=:id', {
            id: req.params.id
        },
        function (err, foundProduct) {
            if (err) {
                console.log(err)
            } else {
                var itemId = foundProduct[0].id
                // multiply that product price with quantity
                var totalAmount = foundProduct[0].price * req.query.q
                //insert this into new order
                //ADD address id here
                c.query('insert into orders(addr_id,user_id,amount) values (:addr_id,:user_id,:amount)', {
                    addr_id: 2,
                    user_id: req.user.ID,
                    amount: totalAmount
                }, function (err, newOrder) {
                    if (err) {
                        console.log(err)
                    } else {
                        // Add items into order_item table
                        c.query('insert into order_item(order_id,item_id,quantity) values(:orderId,:itemId,:quantity)', {
                            orderId: newOrder.info.insertId,
                            itemId: itemId,
                            quantity: req.query.q
                        })
                        res.redirect("/")
                    }
                })
            }
        })
}

orderMiddleware.newOrder = function (req, res) {

    var total = 0
    var curr_total = 0
    // get items from cart
    c.query('select * from cart join products ON cart.item_id=products.id where user_id=:userId', {
        userId: req.user.ID
    }, function (err, foundProduct) {
        if (err) {
            console.log(err)
        } else {
            var total = 0
            var curcr_total = 0
            foundProduct.forEach(function (item) {
                curr_total = item.price * item.quantity
                total += curr_total
            })
            //address find
            c.query('select * from user_addr where user_id=:id', {
                    id: 1
                },
                function (err, foundAddress) {
                    if (err) {
                        console.log(err)
                    } else {
                        //Show all addresses in the page
                        res.render("orders/new", {
                            foundProduct: foundProduct,
                            total: total,
                            foundAddress: foundAddress
                        })
                    }
                }
            )
        }
    })
}



orderMiddleware.postOrder = function (req, res) {
    // insert into order
    // copy data from cart to order_items

    // Check the total price
    var total = 0
    var curr_total = 0
    // get items from cart
    let userId = req.user.ID

    c.query('select * from cart join products ON cart.item_id=products.id where user_id=:userId', {
        userId: userId
    }, function (err, foundProduct) {
        if (err) {
            console.log(err)
        } else {
            var total = 0
            var curcr_total = 0
            foundProduct.forEach(function (item) {
                curr_total = item.price * item.quantity
                total += curr_total
            })
            // If address id is provided in query add address ID
            // Else create new address 
            if (req.query.address) {
                let addr_id = req.query.address
                c.query('insert into orders(addr_id,user_id,amount,status) values (:addr_id,:user_id,:amount,:status)', {
                    addr_id: addr_id,
                    user_id: req.user.ID,
                    amount: total,
                    status: 'ordered'
                }, function (err, newOrder) {
                    if (err) {
                        console.log(err)
                    } else {
                        let order_id = newOrder.info.insertId
                        moveItemsFromCart(order_id,userId);
                        res.redirect('back')
                    }
                })
            } else {
                let fname = req.body.fname
                let lname = req.body.lname
                let address = req.body.address
                let city = req.body.city
                let zip = req.body.zip
                let phone = req.body.phone
                c.query('INSERT INTO user_addr(fname,lname,address,city,zip,phone,user_id) VALUES(:fname,:lname,:address,:city,:zip,:phone,:userId)', {
                    fname: fname,
                    lname: lname,
                    address: address,
                    city: city,
                    zip: zip,
                    phone: phone,
                    userId: userId
                }, (err, newAddress) => {
                    if (err) {
                        console.log(err)
                    }
                    let addr_id = newAddress.info.insertId
                    c.query('insert into orders(addr_id,user_id,amount,status) values (:addr_id,:user_id,:amount,:status)', {
                        addr_id: addr_id,
                        user_id: userId,
                        amount: total,
                        status: 'ordered'
                    }, function (err, newOrder) {
                        if (err) {
                            console.log(err)
                        } else {
                            let order_id = newOrder.info.insertId
                            moveItemsFromCart(order_id,userId);
                            res.redirect('back')
                        }
                    })
                })
            }
        }
    })
}

let moveItemsFromCart = (orderId,userId) => {
    // copy items to order_item
    c.query('SELECT * FROM cart where user_id = :userId', {
        userId: userId
    }, (err, cartItems) => {
        if (err) {
            console.log(err)
        } else {
            cartItems.forEach((item) => {
                c.query('insert into order_items(order_id,item_id,quantity,itemPrice) select :order_id,:itemId,:quantity,price from products where ' +
                    'ID = :itemId', {
                        order_id: orderId,
                        itemId: parseInt(item.item_id),
                        quantity: item.quantity
                    }, (err, addedItem) => {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log(addedItem)
                        }
                    })
            })
            c.query('delete from cart where user_id=:userid', {
                userid: userId
            }, function (err, clearedCart) {
                if (err) {
                    console.log(err)
                } else {}
            })
        }
    })
}
let paypalOrder = () => {

}
orderMiddleware.changeOrderStatus = (req, res) => {
    let status = req.params.status
    let orderId = req.params.id
    c.query('update orders set status=:status where id=:orderId', {
        status: status,
        orderId: orderId
    }, (err, updatedOrder) => {
        if (err) {
            console.log(err)
        } else {
            console.log(updatedOrder)
            res.redirect('back')
        }
    })
}
orderMiddleware.paypalTest = (req, res) => {
    console.log("here")
    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "This",
                    "sku": "001",
                    "price": "25.00",
                    "currency": "CAD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "CAD",
                "total": "25.00"
            },
            "description": "This is the payment description."
        }]
    };



    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            console.log(err)
        } else {
            console.log(payment);

            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href);
                }
            }
            console.log("Create Payment Response");
        }
    });
}


orderMiddleware.successRedirect = (req, res) => {
    let payerId = req.query.PayerID;
    let paymentId = req.query.paymentId;
    var execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "25.00"
            }
        }]
    };

    // var paymentId = 'PAYMENT id created in previous step';

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log("Get Payment Response");
            console.log(JSON.stringify(payment));
            res.send('success')
        }
    })
}
// POST ORDER
// send req.params.id to the ejs file 
module.exports = orderMiddleware