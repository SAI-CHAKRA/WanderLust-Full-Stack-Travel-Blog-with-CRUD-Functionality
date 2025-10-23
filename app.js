if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}
//console.log(process.env);
 

const express = require("express");  
const app = express();
const mongoose = require("mongoose");  

const path = require("path");

const methodOverride = require("method-override");  
app.use(methodOverride('_method'));

app.set("view engine","ejs"); 
app.set("views",path.join(__dirname,"views"));
                         

app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));

const ejsMate = require("ejs-mate");                    
app.engine("ejs",ejsMate);

const ExpressError = require("./utils/ExpressError.js");

const session=require("express-session");  
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");  


const passport = require("passport");  
const LocalStrategy = require("passport-local");  
const User = require("./models/user.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderLust";

const dbUrl = process.env.ATLASDB_URL;  // it won't connect to localhost it connect to online mongo cloud altas database for deployment
// just uncomment out the dbUrl and comment MONGO_URL and it will connect to online database

main().then(()=>{console.log("connected")}) .catch((err)=>{console.log(err)});
 
async function main(){
    await mongoose.connect(dbUrl);
    // await mongoose.connect(MONGO_URL);
}



// for re-initialize the database then run index.js file in init folder
//------

const store = MongoStore.create({
    mongoUrl: dbUrl,
    // mongoUrl: MONGO_URL,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter: 24* 3600,  // in milliseconds for 24hr
});

store.on("error",()=>{
    console.log("ERROR in MONGO SESSION STORE",err);
})

const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()*7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
}; 
app.use(session(sessionOptions));

app.use(flash());
// passport initialize and session should be used after session
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser",async (req,res)=>{
//     let fakeUser = new User({
//         email:"tsc@gmail.com",
//         username:"tsc",
//     });
//     let newUser = await User.register(fakeUser,"password");
//     res.send(newUser);
// })

app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);

// if passing :id in route then it won't pass to reviews , if we try to print it in reviews.js file then it shows undefined
// for that we use mergeParams:true in router in reviews.js file



// app.use("/deleteData",async(req,res)=>{
//     const Listing = require("./models/listing.js");
//     await Listing.deleteMany({});
//     res.send("all data deleted from listing collection");
// }); // to delete all data from listing collection



app.all("*",(req,res,next)=>{   // if we use any random route (instead of above routes) then it shows page not found
    next(new ExpressError(404,"page not found"));
})
app.use((err,req,res,next)=>{
    let {statusCode=500,message="something went wrong"}=err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs",{message});
});
app.listen(8080,()=>{
    console.log("server listening at 8080 port");
});


