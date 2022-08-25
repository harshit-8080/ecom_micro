const mongoose = require("mongoose");
const bcrypt = require("bcrypt");


const userSchema = new mongoose.Schema({
    username:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        unique:true,
        required:true
    }
})

userSchema.pre("save", function(){
    this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(8), null);
})


const UserModel = mongoose.model("UserModel", userSchema);

module.exports = UserModel;