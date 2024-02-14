import Admin from "../models/adminModel.js"
import ErrorHandler from "./ErrorHandler.js"

const verifyMail = async (req, res, next) => {
    try {
        const adminData = await Admin.findById({ _id: req.query.id });
        if (!adminData) {
            return next(new ErrorHandler("Email Verification Failed", 500));
        }
        else {
            await Admin.updateOne({ _id: req.query.id }, { $set: { is_verified: true } });
        }
    } catch (error) {
        console.log(error.message)
    }
    res.status(200).json({
        success: true,
        message: "Email Verification Successful",
    });
}

export default verifyMail