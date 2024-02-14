import mongoose from "mongoose";
import validator from 'validator';

const adminSchema = new mongoose.Schema({
    user_name: {
        type: String,
        required: [true, "Please Enter Your Username"],
        maxLength: [20, "Username cannot exceed 20 characters"],
        minLength: [4, "Username Should have more than 4 characters"],
        unique: true
    },
    email: {
        type: String,
        required: [true, "Please Enter Your Email"],
        unique: true,
        validate: [validator.isEmail, "Please Enter a valid Email"]
    },
    phone_number: {
        type: String,
        required: [true, "Please Enter Your Phone Number"],
        maxLength: [10, "Phone Number cannot exceed 10 digits"],
        minLength: [10, "Phone Number should have 10 digits"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Please Enter Your Password"],
        minLength: [8, "Password Should have more than 8 characters"],
        select: false,
    },
    role: {
        type: String,
        default: "admin",
    },
    is_verified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default mongoose.model("Admin", adminSchema);