// initializing the database
// for re-initializing the database, run this file


const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderLust";

main().then(()=>{console.log("connected")}) .catch((err)=>{console.log(err)});

async function main(){
    await mongoose.connect(MONGO_URL);
}

const initDB = async()=>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj,owner:"67c491fb2dec71bbfb397d97"}));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
}
initDB();