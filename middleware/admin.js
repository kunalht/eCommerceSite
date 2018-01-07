const client = require('mariasql'),
    mysqlAuth = require('../config/mysqlAuth')


const adminMiddleware = {}
const c = new client({
    host: mysqlAuth.mysqlAuth.host,
    user: mysqlAuth.mysqlAuth.user,
    password: mysqlAuth.mysqlAuth.password,
    port: mysqlAuth.mysqlAuth.port,
    db: mysqlAuth.mysqlAuth.db
})

adminMiddleware.getAllOrders = (req,res)=> {
    c.query("select O.*,U.email,U.nickname,U.fullname from orders AS O join user AS U ON O.user_id = U.ID", (err, foundOrder)=>{
        if(err){
            console.log(err)
        }else{
            res.render('orders/index',{orders:foundOrder})
            // console.log(items)
        }
    })
}

adminMiddleware.getOrderById = (req,res) => {
    let orderId = req.params.id
    // select O.*,U.ID,U.email,U.fullname,U.nickname,OI.*,UA.* from orders AS O join order_items AS OI ON O.ID = OI.order_id left join user AS U ON O.user_id = U.ID join user_addr AS UA ON O.addr_id =UA.ID where O.ID = 2
    c.query('select O.*,U.ID,U.email,U.fullname,U.nickname,UA.* from orders AS O '+
    'left join user AS U ON O.user_id = U.ID '+
    'join user_addr AS UA ON O.addr_id =UA.ID where O.ID =:orderId',{orderId:orderId},(err,foundOrder)=>{
        if(err){
            console.log(err)
        }else{
            console.log(foundOrder)
            c.query('select * from order_items join products ON order_items.item_id = products.ID where order_id=:orderId',{orderId:orderId},(err,orderItems)=>{
                if(err){
                    console.log(err)
                }else{
                    console.log(orderItems)
                    res.render('orders/show',{order:foundOrder,items:orderItems})
                }
            })
        }
    })
}


module.exports = adminMiddleware