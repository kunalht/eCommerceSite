const client = require('mariasql'),
    multer = require('multer'),
    jimp = require('jimp'),
    uuid = require('uuid')

const productMiddleware = {}
const c = new client({
    host: 'localhost',
    user: 'root',
    password: 'kunal',
    port: 3307,
    db: 'ddif'
})
var multerOptions = {
    storage: multer.memoryStorage(),
    fileFilter(req, file, next) {
        var isPhoto = file.mimetype.startsWith("image/")
        if (isPhoto) {
            next(null, true)
        } else {
            // req.flash("error", "File type not allowed")
        }
    }
}
var upload = multer(multerOptions)

function resize(req, res, next) {
    if (!req.file) {
        next()
    } else {
        var extension = req.file.mimetype.split('/')[1]
        req.body.photo =uuid.v4() + "." + extension
        // fs.mkdir("images/" + temp_user)
        // console.log(req.body.photo)
        // var photo = jimp.read(req.file.buffer)
        // console.log(photo)
        jimp.read(req.file.buffer, function (err, image) {
            image.resize(600, jimp.AUTO)
            image.write("images/" + req.body.photo)
        })

        // photo.resize(600, jimp.AUTO)
        next()
    }
}


productMiddleware.getAllProducts = function (req, res) {
    if(req.query.page == null){
        var page = 1
    }else{
        var page = req.query.page
    }
    c.query("select * from products order by id desc", function (err, products) {
        if (err) { console.log(err) }
        else {
            res.render("products/index", {products:products,page:page})
        }
    })
}

productMiddleware.getNewProductForm = function (req, res) {
    res.render("products/new")
}

productMiddleware.addNewProduct = function (req, res) {
    c.query("insert into products (name,price,image) values (:name,:price,:image)", { name: req.body.name, price: req.body.price,image:req.body.photo }, function (err, newlyCreated) {
        if (err) {
            console.log(err)
        } else {
            res.redirect("/")
        }
    })
}



c.end()

module.exports = productMiddleware