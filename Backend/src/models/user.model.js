import bcrypt from "bcryptjs";
import mongoose, { Schema } from "mongoose";

const userSchema= new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profileImage: {
        type: String,
        default: "",
    },
    tripList: {
        type: Array,
        default: []
    },
    wishList: {
        type: Array,
        default: []
    },
    propertyList: {
        type: Array,
        default: []
    },
    reservationList: {
        type: Array,
        default: []
    },
}, {timestamp: true})

userSchema.pre("save", async function (next){ // Encrypt the password
    if(this.isModified("password"))
    {
        this.password= await bcrypt.hash(this.password, 10)
    }
    
    next()
})

export const User= mongoose.model("User", userSchema);