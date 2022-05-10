const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema({

    userName: {
        type: String,
        default: "Unknown"
    },
    userPhone: {
        type: String,
        default: "Unknown"
    },
    userAddress: {
        type: String,
        default: "Unknown"
    },
    suspectName: {
        type: String,
        required: true
    },
    suspectPhone: {
        type: String,
        required: true
    },
    suspectAddress: {
        type: String,
        required: true
    },
    suspectImage: {
        type: String,
        default:"images/empty_profile.webp"
    },
    crimeDescription: {
        type: String,
        required: true
    },
    crimeAddress: {
        type: String,
        required: true
    },
    crimeState: {
        type: String,
        required: true
    },
    crimeDate: {
        type: Date,
        required: true
    },
    solved: {
        type: Number,
        default:0
    },
    casetaken: [ {
        type: mongoose.Types.ObjectId,
        ref: "Police"
     }]
});

const Complaint = new mongoose.model("Complaint",ComplaintSchema);

module.exports.Complaint = Complaint;