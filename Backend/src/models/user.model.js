import bcrypt from "bcryptjs";
import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";

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
    token: {
        type: String,
        default: ""
    }
}, {timestamps: true})

userSchema.pre("save", async function (next){ // Encrypt the password
    if(this.isModified("password"))
    {
        this.password= await bcrypt.hash(this.password, 10)
    }
    
    next()
})

userSchema.methods.isPasswordCorrect= async function(password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateToken= function() {
    const payload = {
        _id: this._id,
        email: this.email
    };
    
    console.log("JWT payload:", payload);
    
    const token = jwt.sign(
        payload,
        process.env.TOKEN_SECRET,
        {
            expiresIn: process.env.TOKEN_EXPIRY || '11d'
        }
    );
    return token;
}

export const User= mongoose.model("User", userSchema);