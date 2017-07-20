const client = require('mariasql')
const orderMiddleware = {}
const c = new client({
    host: 'localhost',
    user: 'root',
    password: 'kunal',
    port: 3307,
    db: 'ddif',
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
                console.log(req.query)

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

orderMiddleware.newOrder = async (req, res) =>{
    res.send("aaa")
}

// orderMiddleware.newOrder = function (req, res) {
//     var total = 0
//     var curr_total = 0
//     // get items from cart
//     c.query('select * from cart where user_id=:userId',
//         { userId: req.user.ID }, function (err, cart) {
//             if (err) {
//                 console.log(err)
//             } else {

//                 cart.forEach(function (item) {
//                     // Find item from DB and check their price
//                     c.query('select * from products where id=:id',
//                         { id: item.item_id },
//                         function (err, foundItem) {
//                             if (err) {
//                                 console.log(err)
//                             } else {
//                                 curr_total = foundItem[0].price * item.quantity
//                                 console.log("currenttotal" + curr_total)
//                                 total += curr_total
//                                 console.log(total)
//                             }
//                         })
//                 })
//                 console.log(total)
//                 console.log(curr_total)
//                 // Calculate total price
//                 // Multiply all items with their quantity
//                 res.render('orders/new', { cart: cart, total: total })
//             }
//         })
// }
// POST ORDER
// send req.params.id to the ejs file 
module.exports = orderMiddleware