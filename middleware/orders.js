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
                        id: req.user.id
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
                    user_id: req.user.id,
                    amount: totalAmount
                }, function (err, newOrder) {
                    if (err) {
                        console.log(err)
                    } else {
                        // Add items into order_item table
                        c.query('insert into order_items(order_id,item_id,quantity) values(:orderId,:itemId,:quantity)', {
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
    let userId = req.user.id
    // get items from cart
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
            //address find
            c.query('select * from user_addr where user_id=:id', {
                    id: userId
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

    // Check the total price
    var total = 0
    var curr_total = 0
    // get items from cart
    let userId = req.user.id

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
                    user_id: req.user.id,
                    amount: total,
                    status: 'ordered'
                }, function (err, newOrder) {
                    if (err) {
                        console.log(err)
                    } else {
                        let order_id = newOrder.info.insertId
                        moveItemsFromCart(order_id,userId);
                        paypalOrder(req, res, foundProduct, order_id)
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
                    console.log(newAddress)
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
                            console.log(foundProduct)
                            console.log(order_id)
                            let order_id = newOrder.info.insertId
                            moveItemsFromCart(order_id,userId);
                            paypalOrder(req, res, foundProduct, order_id)
                            // res.redirect('back')
                        }
                    })
                })
            }
        }
    })
}

orderMiddleware.successOrder = (req, res ) => {
    console.log(req.query)
    let payerId = req.query.PayerID;
    let paymentId = req.query.paymentId;
    c.query('SELECT amount FROM paypalAmount WHERE paypalId=:paypalId',{paypalId:paymentId},(err,amount) => {
        if(err){
            console.log(err)
        }else{
            let totalAmount = amount[0].amount
            console.log(amount[0].amount)
            var execute_payment_json = {
                "payer_id": payerId,
                "transactions": [{
                    "amount": {
                        "currency": "CAD",
                        "total": totalAmount
                    }
                }]
            };        
            paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
                if (error) {
                    console.log(error.response);
                    throw error;
                } else {
                    let paymentId = payment.id
                    let paymentMethod = payment.payer.payment_method
                    let payerEmail = payment.payer.payer_info.email
                    let payerId = payment.payer.payer_info.payer_id
                    let cart = payment.cart
                    let transactionCurrency = payment.transactions[0].amount.currency
                    let transactionAmount = payment.transactions[0].amount.total
                    let response = payment.toString();
                    // let payerFirstName = payment.payer.payer_info.first_name
                    // let payerLastName = payment.payer.payer_info.last_name
                    // let payerShippingName = payment.payer.payer_info.shipping_address.recipient_name
                    // let payerAddress = payment.payer.payer_info.shipping_address.line1
                    // let payerCity = payment.payer.payer_info.shipping_address.city
                    // let payerPostalCode = payment.payer.payer_info.shipping_address.postal_code
                    // let merchentId = payment.transactions[0].payee.merchant_id
                    // let payeeEmail = payment.transactions[0].payee.email
                    // let description = payment.transactions[0].description
                    // let productName = payment.transactions[0].item_list.items[0].name
                    
                    c.query('INSERT INTO paypalOrder(paymentId,cart,paymentMethod,payerEmail,payerId,transactionCurrency,transactionAmount,response) '+
                        'VALUES(:paymentId,:cart,:paymentMethod,:payerEmail,:payerId,:transactionCurrency,:transactionAmount)',
                        {paymentId:paymentId,cart:cart,paymentMethod:paymentMethod,payerEmail:payerEmail,payerId:payerId,
                            transactionCurrency:transactionCurrency,transactionAmount:transactionAmount,response:response},(err,newPyapal)=>{
                                console.log(newPyapal)
                            })
                    console.log("Get Payment Response");
                    console.log(JSON.stringify(payment));
                    res.send('success')
                }
            })
        }
    })
}

orderMiddleware.cancelOrder = (req, res) => {
    console.log(req.query)
}

let paypalOrder = (req, res, foundProduct, order_id) => {
    let productId = foundProduct[0].id
    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/order_success",
            "cancel_url": "http://localhost:3000/order_cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": foundProduct[0].name,
                    "sku": foundProduct[0].id,
                    "price": foundProduct[0].price,
                    "orderId":order_id,
                    "currency": "CAD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "CAD",
                "total": foundProduct[0].price
            },
            "description": ` Product ID: ${productId} and order id : ${order_id}`
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            console.log(error)
        } else {
            let paypalId = payment.id
            let amount = payment.transactions[0].amount.total
            console.log(JSON.stringify(payment))    
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    c.query('INSERT INTO paypalAmount(paypalId, amount) VALUES(:paypalId,:amount)',{paypalId:paypalId,amount:amount},(err, newAmount)=> {
                        if(err){
                            console.log(err)
                        }else{
                            res.redirect(payment.links[i].href);
                        }
                    })
                }
            }
        }
    });
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
                    'id = :itemId', {
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