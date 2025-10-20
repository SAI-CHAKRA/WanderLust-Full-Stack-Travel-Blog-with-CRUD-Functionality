const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({accessToken: mapToken});

module.exports.index=async (req,res)=>{
    let allListings = await Listing.find({});
    res.render("./listings/index.ejs",{allListings});
};

module.exports.renderNewForm=(req,res)=>{            // if we keep new route below the show route then in /listings/new  new is treated as and id because we given an id in show route , so we keep it first(new route) then after we keep show route
    //console.log(req.user);
    res.render("listings/new.ejs");
};

module.exports.showListing = async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");  // nested populate
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    //console.log(listing.owner.username);
   
    res.render("listings/show.ejs",{listing});
};

module.exports.createListing = async(req,res,next)=>{
    
    // let {title,description,image,price,location,country} = req.body; // here we use .listings because we use another way of writing in new.ejs file
    
    // let listing = req.body.listings;                
    // let newListing = new Listing(listing);   or
 
    //let result = listingSchema.validate(req.body);
    
    // we use validation so no need to use below commented code
    // if(!req.body.listings){ // if we try to use create route through hoppscotch (without data we can't save it so we used it)
    //     throw new ExpressError(400,"send valid data for listings");   // status code 400 is for bad request from client
    // }

    let response = await geocodingClient
        .forwardGeocode({
            query: req.body.listing.location,
            limit:1,
        })
        .send();
        //console.log(response);
        //console.log(response.body.features[0].geometry);

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url,filename};

    newListing.geometry = response.body.features[0].geometry;

    let savedListing = await newListing.save();
    //console.log(savedListing);

    req.flash("success","Successfully created a new listing");
    res.redirect("/listings");

};

module.exports.renderEditForm = async(req,res)=>{  
    let {id}=req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    };

    let originalImageUrl = listing.image.url;
    console.log(originalImageUrl);
    originalImageUrl = originalImageUrl.replace("/upload","/upload/h_300,w_300/e_blur:300");  // making height and width of image which uploaded in cloudinary to 300 , for more about read doc of cloudinary
    console.log(originalImageUrl);
    console.log(listing._id);
    res.render("listings/edit.ejs",{listing,originalImageUrl});

};
  
module.exports.updateListing = async(req,res)=>{
    // if(!req.body.listings){ // if we try to use create route through hoppscotch (without data we can't save it so we used it)
    //     throw new ExpressError(400,"send valid data for listings");   // status code 400 is for bad request from client
    // }
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});  // ... indicated deconstruction i.e we are deconstruct the listings with key,value pairs and passes it as parameter
    
    let url = req.file.path;
    let filename = req.file.filename;
    if(typeof req.file != "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url,filename};
        await listing.save();
    }

    req.flash("success","listing updated");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async(req,res)=>{   // error here router.delete() is not working even i used method override in show.ejs
    let {id}=req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    //console.log(deleteListing);
    req.flash("success","listing deleted");
    res.redirect("/listings");
};