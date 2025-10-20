const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");

const listingController = require("../controllers/listing.js");

const multer = require("multer");

const {storage} = require("../cloudConfig.js")
const upload = multer({storage});

router
    .route("/")     // this is the common route which are used below route paths so we group them together using router.route(path)
    .get(wrapAsync(listingController.index))   // index route
    .post(isLoggedIn,upload.single('listing[image]'),validateListing,wrapAsync(listingController.createListing));  // create route
    
// New Route
router.get("/new",isLoggedIn,listingController.renderNewForm);


router
    .route("/:id")  // this is the common route which are used below route paths so we group them together using router.route(path)
    .get(wrapAsync(listingController.showListing))   // show route
    .put(isLoggedIn,isOwner,upload.single('listing[image]'),validateListing,wrapAsync(listingController.updateListing))   // update route
    .delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing)); // delete route



// edit route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));


module.exports = router;