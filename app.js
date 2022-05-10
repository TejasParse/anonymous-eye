const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const mongoose = require("mongoose");
const { Complaint } = require("./models/Complaint");
const bcrypt = require("bcrypt");
const { Police } = require("./models/Police");

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
        maxAge: 1000*60*60*24
    },
    resave: false,
    saveUninitialized: true
}))
app.use(flash());



let states = [ "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jammu and Kashmir","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttarakhand","Uttar Pradesh","West Bengal","Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli","Daman and Diu","Delhi","Lakshadweep","Puducherry"]

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.fail = req.flash("fail");
    res.locals.user_id = req.session.user_id;
    res.locals.states = states;
    next();
})

const verifyComplaint = (req,res,next)=>{

    if(req.session.complained==null) {
        return next();
    }

    req.flash("fail",`Please wait and refresh page after ${parseInt(req.session.cookie.maxAge/1000)} seconds before lodging another complaint!`);
    res.redirect("/");

};

const verifyLogin = (req,res,next)=>{

    if(req.session.user_id) {
        return next();
    }

    req.flash("fail","Please login to view this page");
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

    console.log(req.body);

    const { username, password } = req.body;

    const profile = await Police.findOne({username});

    if(profile==undefined) {
        req.flash("fail","Please enter correct username and password");
        return res.redirect("/login");
    }

    const verified = await bcrypt.compare(password,profile.password);

    if(verified) {

        req.session.user_id = profile._id;
        req.session.currentUser = profile;

        req.flash("success","Login Successfull");
        res.redirect("/");

    } else {

        req.flash("fail","Please enter correct username and password");
        return res.redirect("/login");

    }

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

app.get("/logout",async (req,res)=>{

    req.session.user_id = undefined;

    req.flash("success","Logged out successfully");
    res.redirect("/");

});

app.get("/dashboard",verifyLogin,async (req,res)=>{

    console.log(req.query);
    if(req.query.state==undefined) {
        req.query.state="";
    }

    const complaints = await Complaint.find({
        crimeState : {
            $regex: req.query.state,
            $options: "i"
        }
    }).populate('casetaken','name').sort({solved:1});
    console.log(complaints);
    
    const PoliceUser = await Police.findById(req.session.user_id);

    const taken = PoliceUser.takenIds;

    res.render("dashboard",{complaints, taken});

});

app.get("/takeupcase",verifyLogin,async(req,res)=>{

    console.log(req.query);

    console.log(req.session.user_id);

    const policeUser = await Police.findById(req.session.user_id);
    console.log(policeUser);

    const complaintData = await Complaint.findById(req.query.id);
    console.log(complaintData);

    const pushed = await complaintData.casetaken.push(policeUser);
    await complaintData.save();

    const pushed1 = await policeUser.takenIds.push(complaintData);
    await policeUser.save();

    req.flash("success","Case Taken By You!");
    res.redirect("/dashboard");

});

app.get("/Case/:id", verifyLogin, async(req,res)=>{


    const { id } = req.params;

    const complaintData = await Complaint.findById(id).populate('casetaken','name');
    console.log(complaintData);

    const PoliceUser = await Police.findById(req.session.user_id);
    const taken = PoliceUser.takenIds;

    res.render("case",{data:complaintData,taken});

})

app.get("/solved/:id", verifyLogin, async (req,res)=>{

    const { id } = req.params;

    const complaintData = await Complaint.findById(id);
    complaintData.solved=1;
    await complaintData.save();

    req.flash("success","Congrats on solving the case");
    res.redirect("/dashboard");

});

app.get("*",(req,res)=>{
    req.flash("fail","Page Not Found");
    res.redirect("/");
})