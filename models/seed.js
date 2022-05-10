const { Police } = require("./Police");
const mongoose= require("mongoose");
const bcrypt = require("bcrypt");

mongoose.connect("mongodb://localhost:27017/GDSChackathon")
    .then(async ()=>{
        console.log("MongoDB connected!");
        const temp = await Police.deleteMany({});
        createPolice();
    })
    .catch((err)=>{
        console.log("MongoDB Connection Failed!");
        console.log(err);
    });

const getHashedPassword = async (pwd)=>{

    const hash = await bcrypt.hash(pwd,12);
    return hash;
};


const createPolice = async ()=> {

    const getPwd= await bcrypt.hash("123456789",10);

    const police = new Police({
        name: "Tejas Parse",
        username: "tejasparse",
        password: getPwd,
        department: "Central Reserve Police Force",
        state: "Telangana",
        phone: "9789788788",
        address: "Ram Nagar, Khairatabad",
        districtAssigned: "Hyderabad"
    });

    police.save()
        .then(()=>{
            console.log("Police Registered");
            console.log("Login Credentials generated. Username: 'tejasparse' Password: '1234556789'");
        })
        .catch(err=>{
            console.log("Police Failed");
            console.log(err);
        })
}

