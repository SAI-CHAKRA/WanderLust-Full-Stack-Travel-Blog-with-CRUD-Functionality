const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router();
const User=require("../models/user.js");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js");
const userController = require("../controllers/user.js");

router.get("/", (req, res) => {
    // This tells the browser to navigate to the /signup route
    res.redirect("/signup"); 
});


router       // this is the common route which are used below route paths so we group them together using router.route(path)
    .route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup))

router
    .route("/login")
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl,
        passport.authenticate("local",{
        failureRedirect:"/login",failureFlash:true
        }),
        userController.login
    );
                // actual login is done by passport

// actual logout is done by passport
router.get("/logout",userController.logout);


module.exports = router;
