const express = require("express");
const app = express();
const path = require("path");
const UserRouter = require("./routes/User");
const session = require("express-session");
const flash = require("connect-flash");
const mongoose = require("mongoose");
const { Complaint } = require("./models/Complaint");
const bcrypt = require("bcrypt");

mongoose.connect("mongodb://localhost:27017/GDSChackathon")
    .then(()=>{
        console.log("MongoDB connected!");
    })
    .catch((err)=>{
        console.log("MongoDB Connection Failed!");
        console.log(err);
    });


const PORT=3000;

app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");

app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,"public")));
app.use(session({
    secret: "thisisasecretkey",
    cookie: {
        httpOnly: true,
        maxAge: 1000*5
    },
    resave: false,
    saveUninitialized: true
}))
app.use(flash());

app.use("/User",UserRouter);

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.fail = req.flash("fail");
    next();
})

let states = [ "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jammu and Kashmir","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttarakhand","Uttar Pradesh","West Bengal","Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli","Daman and Diu","Delhi","Lakshadweep","Puducherry"]

const verifyComplaint = (req,res,next)=>{

    if(req.session.complained==null) {
        return next();
    }

    req.flash("fail",`Please wait and refresh page after ${parseInt(req.session.cookie.maxAge/1000)} seconds before lodging another complaint!`);
    res.redirect("/");

};

app.listen(PORT,()=>{
    console.log("Listening to port 3000");
});

app.get("/", (req,res)=>{

    res.render("home");
    
});

app.get("/complaint",(req,res)=>{

    console.log("Inside Complaint");

    req.session.complained = true;
    req.session.complainedTime = new Date();

    // req.session._garbage = Date();
    // req.session.touch();  
    // req.session.cookie.expires = 1000*5; 

    res.render("complaint",{states});

});

app.post("/complaint",async (req,res)=>{

    if(req.body["g-recaptcha-response"]==="") {
        req.flash("fail","Please do the reCAPTCHA");
        return res.redirect("/complaint");
      
    }

    const complaint = new Complaint(req.body);
    complaint.save()
        .then(()=>{
            req.flash("success","Complaint registered!");
            res.redirect("/");
        })
        .catch(err=>{
            req.flash("fail","Complaint did not register");
            res.redirect("/");
        });


});

app.get("/login", async (req,res)=>{
    res.render("login");
});

app.post("/login", async (req,res)=>{

    res.send(req.body);

});

app.get("/test", (req,res)=>{

    // console.log(req.session.complained);
    // console.log(req.session.usedTime);

    if(req.session.complained == null) {
        req.session.complained = 5;
        req.session.usedTime = new Date();
    } else {
        const timeNow = new Date();
        const timeThen = new Date(req.session.usedTime);
        console.log(timeNow);
        console.log(timeThen);
        const timeDiff = parseInt((timeNow - timeThen)/1000);
        console.log(timeDiff);
    }

    res.send("Hoi");

});