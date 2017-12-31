const client = require('mariasql'),
mysqlAuth = require('../config/mysqlAuth')

const orderMiddleware = {}
const c = new client({
    host: mysqlAuth.mysqlAuth.host,
    user: mysqlAuth.mysqlAuth.user,
    password: mysqlAuth.mysqlAuth.password,
    port: mysqlAuth.mysqlAuth.port,
    db: mysqlAuth.mysqlAuth.db
})


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
    c.query('select * from products where id=:id', { id: req.params.id },
        function (err, foundProduct) {
            if (err) {

            } else {
                //address find
                c.query('select * from user_addr where user_id=:id',
                    { id: req.user.ID },
                    function (err, foundAddress) {
                        if (err) {
                            console.log(err)
                        } else {
                            //Show all addresses in the page
                            res.render("orders/newSingle",
                                { foundProduct: foundProduct, foundAddress: foundAddress, quantity: quantity })
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
    c.query('select * from products where id=:id',
        { id: req.params.id },
        function (err, foundProduct) {
            if (err) {
                console.log(err)
            } else {
                var itemId = foundProduct[0].id
                // multiply that product price with quantity
                var totalAmount = foundProduct[0].price * req.query.q
                //insert this into new order
                //ADD address id here
                c.query('insert into orders(addr_id,user_id,amount) values (:addr_id,:user_id,:amount)',
                    { addr_id: 2, user_id: req.user.ID, amount: totalAmount }, function (err, newOrder) {
                        if (err) {
                            console.log(err)
                        } else {
                            // Add items into order_item table
                            c.query('insert into order_item(order_id,item_id,quantity) values(:orderId,:itemId,:quantity)',
                                { orderId: newOrder.info.insertId, itemId: itemId, quantity: req.query.q })
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
    c.query('select * from cart join products ON cart.item_id=products.id where user_id=:userId',
        { userId: req.user.ID }, function (err, foundProduct) {
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
                c.query('select * from user_addr where user_id=:id',
                    { id: 1 },
                    function (err, foundAddress) {
                        if (err) {
                            console.log(err)
                        } else {
                            //Show all addresses in the page
                            res.render("orders/new", { foundProduct: foundProduct, total: total, foundAddress: foundAddress })
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
    c.query('select * from cart join products ON cart.item_id=products.id where user_id=:userId',
        { userId: req.user.ID }, function (err, foundProduct) {
            if (err) {
                console.log(err)
            } else {
                var total = 0
                var curcr_total = 0
                foundProduct.forEach(function (item) {
                    curr_total = item.price * item.quantity
                    total += curr_total
                    console.log("FIRST")
                })
                // If address id is provided in query add address ID
                // Else create new address 
                console.log(req.query)
                if(req.query.addr_id){
                    console.log("SECOND")
                    addr_id = req.query.address
                    c.query('insert into orders(addr_id,user_id,amount) values (:addr_id,:user_id,:amount)',
                        { addr_id: addr_id, user_id: req.user.ID, amount: total }, function (err, newOrder) {
                            if (err) {
                                console.log(err)
                            } else {
                                // order_id = newOrder.info.insertId
                                // copy items to order_item
                                let order_id 
                                c.query('insert into order_item(order_id,item_id,quantity,itemPrice) select :order_id,item_id,quantity from cart where user_id= :user_id select price from products',
                                    { order_id: newOrder.info.insertId, user_id: req.user.ID }, function (err, addeditems) {
                                        if (err) {
                                            console.log(err)
                                        } else {
                                            c.query('delete from cart where user_id=:userid',
                                                { userid: req.user.ID }, function (err, clearedCart) {
                                                    if (err) {
                                                        console.log(err)
                                                    } else {
                                                        res.send("done")
                                                        // clearcart
                                                    }
                                                })
                                        }
                                    })
                            }
                        })
                }else{
                    console.log("here")
                    let fname = req.body.fname
                    let lname = req.body.lname
                    let address = req.body.address
                    let city = req.body.city
                    let zip = req.body.zip
                    let phone = req.body.phone
                    let userId = req.user.ID
                    c.query('INSERT INTO user_addr(fname,lname,address,city,zip,phone,user_id) VALUES(:fname,:lname,:address,:city,:zip,:phone,:userId)',
                    {fname:fname,lname:lname,address:address,city:city,zip:zip,phone:phone,userId:userId},(err,newAddress)=>{
                        if(err){
                            console.log(err)
                        }
                        console.log(newAddress)
                        let addr_id = newAddress.info.insertId
                        c.query('insert into orders(addr_id,user_id,amount) values (:addr_id,:user_id,:amount)',
                            { addr_id: addr_id, user_id: userId, amount: total }, function (err, newOrder) {
                                if (err) {
                                    console.log(err)
                                } else {
                                    // order_id = newOrder.info.insertId
                                    // copy items to order_item
                                    c.query('insert into order_item(order_id,item_id,quantity) select :order_id,item_id,quantity from cart where user_id= :user_id',
                                        { order_id: newOrder.info.insertId, user_id:userId }, function (err, addeditems) {
                                            if (err) {
                                                console.log(err)
                                            } else {
                                                c.query('delete from cart where user_id=:userid',
                                                    { userid: req.user.ID }, function (err, clearedCart) {
                                                        if (err) {
                                                            console.log(err)
                                                        } else {
                                                            res.send("done")
                                                            // clearcart
                                                        }
                                                    })
                                            }
                                        })
                                }
                            })
                    })
                }
            }
        })
}
// POST ORDER
// send req.params.id to the ejs file 
module.exports = orderMiddleware