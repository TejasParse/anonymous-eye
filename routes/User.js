const express = require("express");
const UserRouter = express.Router();

UserRouter.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.fail = req.flash("fail");
    console.log("Inside middleware");
    next();
})

UserRouter.get("/",(req,res)=>{

    res.send("User Hello");

});

module.exports = UserRouter;