const express = require("express"),
      router = express.Router(),
      middlewareObj = require("../middleware/index"),
      productMiddleware = require("../middleware/products"),
      multer = require('multer'),
      jimp = require('jimp'),
      uuid = require('uuid'),
      fs = require("file-system")
// var upload = multer({ dest: 'images/' })

var multerOptions = {
      storage: multer.memoryStorage(),
      fileFilter(req, file, next) {
            var isPhoto = file.mimetype.startsWith("image/")
            if (isPhoto) {
                  console.log("is photo")
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
            req.body.photo = uuid.v4() + "." + extension
            // fs.mkdir("images/")
            // console.log(req.body.photo)
            var photo = jimp.read(req.file.buffer)
            // console.log(photo)
            jimp.read(req.file.buffer, function (err, image) {
                  image.resize(536, 498)
                  // image.resize(600, jimp.AUTO)
                  image.write("images/" + req.body.photo)
            })

            // photo.resize(600, jimp.AUTO)
            next()
      }
}
router.get("/products", productMiddleware.getAllProducts)
router.get("/products/new", middlewareObj.checkisAdmin, productMiddleware.getNewProductForm)
router.post("/products", upload.single('photo'), resize, productMiddleware.addNewProduct)
router.get("/product/:id",productMiddleware.getProduct)
// router.post("/products", upload.single('photo'), function (req, res) {
//       console.log(req.file)
//       console.log(req.files)
//       console.log(req.body)
// })
module.exports = router;