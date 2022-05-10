const mongoose = require("mongoose");

const PoliceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password :{
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    ImageUrl: {
        type: String,
        default: "images/empty_profile.webp"
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },  
    districtAssigned: {
        type: String,
        required: true
    }
});

const Police = new mongoose.model("Police",PoliceSchema);

module.exports.Police = Police;