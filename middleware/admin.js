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

adminMiddleware.getAllOrders = (req, res) => {
    let orderStatus = req.query ? req.query.status : null
    console.log(req.query)
    console.log(orderStatus)
    let sqlQuery = null
    if (orderStatus) {
        sqlQuery = "select O.*,U.email,U.nickname,U.fullname from orders AS O join user AS U ON O.user_id = U.ID where O.status = \"" + orderStatus + "\" "
    } else {
        sqlQuery = "select O.*,U.email,U.nickname,U.fullname from orders AS O join user AS U ON O.user_id = U.ID"
    }
    // let sqlQuery = "select O.*,U.email,U.nickname,U.fullname from orders AS O join user AS U ON O.user_id = U.ID where O.status = " + orderStatus
    console.log(sqlQuery)
    c.query(sqlQuery, (err, foundOrder) => {
        if (err) {
            console.log(err)
        } else {
            res.render('orders/index', {
                orders: foundOrder
            })
        }
    })
}

adminMiddleware.getOrderById = (req, res) => {
    let orderId = req.params.id
    // select O.*,U.ID,U.email,U.fullname,U.nickname,OI.*,UA.* from orders AS O join order_items AS OI ON O.ID = OI.order_id left join user AS U ON O.user_id = U.ID join user_addr AS UA ON O.addr_id =UA.ID where O.ID = 2
    c.query('select O.*,U.ID,U.email,U.fullname,U.nickname,UA.* from orders AS O ' +
        'left join user AS U ON O.user_id = U.ID ' +
        'join user_addr AS UA ON O.addr_id =UA.ID where O.ID =:orderId', {
            orderId: orderId
        }, (err, foundOrder) => {
            if (err) {
                console.log(err)
            } else {
                console.log(foundOrder)
                c.query('select * from order_items join products ON order_items.item_id = products.ID where order_id=:orderId', {
                    orderId: orderId
                }, (err, orderItems) => {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log(orderItems)
                        res.render('orders/show', {
                            order: foundOrder,
                            items: orderItems
                        })
                    }
                })
            }
        })
}

//Add or modify categories
adminMiddleware.newCategory = (req, res) => {
    c.query('select * from categories', (err, categories) => {
        if (err) {
            console.log(err)
        } else {
            console.log(categories)
            res.render('categories/new', {
                categories: categories
            })
        }
    })
}

adminMiddleware.postCategory = (req, res) => {
    console.log(req.body)
    let parentCat = req.body.parentCat ? req.body.parentCat : null
    let categoryName = req.body.name
    c.query('insert into categories (name,parent_id) values (:name,:parent_id)', {
        name: categoryName,
        parent_id: parentCat
    }, (err, newCategory) => {
        if (err) {
            console.log(err)
        } else {
            console.log(newCategory)
        }
    })
}

adminMiddleware.editCategory = ( req, res ) => {
    let id = req.params.id
    c.query('select * from category where id = :id',{id:id},(err,changedCat)=>{
        if(err){
            console.log(err)
        }else{
            res.redirect('back')
        }
    })
}

module.exports = adminMiddleware