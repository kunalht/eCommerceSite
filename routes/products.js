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
                  next(null, true)
            } else {
                  // req.flash("error", "File type not allowed")
            }
      }
}
var upload = multer(multerOptions)

function resize(req, res, next) {
      if (!req.files) {
            next()
      } else {
            req.body.photos = [];
            req.files.forEach((file) => {
                  var extension = file.mimetype.split('/')[1]
                  let imageName = uuid.v4() + "." + extension;
                  req.body.photos.push(imageName);
                  // fs.mkdir("images/")
                  // console.log(req.body.photo)
                  var photo = jimp.read(file.buffer)
                  // console.log(photo)
                  jimp.read(file.buffer, function (err, image) {
                        image.resize(536, 498)
                        // image.resize(600, jimp.AUTO)
                        image.write("images/" + imageName)
                  })
            })
            next()
      }
}

router.get("/products", productMiddleware.getAllProducts)
router.get("/products/new", middlewareObj.checkisAdmin, productMiddleware.getNewProductForm)
// router.get("/products/new", productMiddleware.getNewProductForm)
router.post("/products", upload.array('photo'), resize, productMiddleware.addNewProduct)
router.get("/product/:id",productMiddleware.getProduct)

module.exports = router;