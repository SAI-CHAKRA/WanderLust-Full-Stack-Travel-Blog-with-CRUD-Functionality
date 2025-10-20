
const Listing = require("./models/listing");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review=require("./models/review.js");    

module.exports.isLoggedIn = (req,res,next)=>{
    // console.log(req+".."+req.path+".."+req.originalUrl);
    //console.log(req.user);
    req.session.redirectUrl = req.originalUrl;
    if(!req.isAuthenticated()){
        req.flash("error","You must be signed in to create a new listing");
        return res.redirect("/login");
    }
    next();
};
module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner=async (req,res,next)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","You don't have permission to edit");
        return res.redirect(`/listings/${id}`);
    };
    next();
}

module.exports.isReviewAuthor = async(req,res,next)=>{
    let {id,reviewId} = req.params;
    let review = await Review.findById(reviewId);
    console.log(res.locals.currUser._id+"->"+review.author._id)
    if(!review.author._id.equals(res.locals.currUser._id)){
        req.flash("error","You are not the author this reviews");
        return res.redirect(`/listings/${id}`);
    };
    next();
}
module.exports.validateListing = (req,res,next)=>{
    // server side validation for listing using JOI in schema.js file
    // console.log(req.body); // debugging step
    let{ error } = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    } 
}

module.exports.validateReview=(req,res,next)=>{
    //  server side validation for reviews using JOI in schema.js file
     //console.log(req.body);
     let{ error } = reviewSchema.validate(req.body);
     //console.log(error);
     if(error){ 
         let errMsg = error.details.map((el)=>el.message).join(",");
         //console.log("Error Messages: ",errMsg);
         throw new ExpressError(400,errMsg);
     }else{
         //console.log("Validation Passed");
         next();
     }
}