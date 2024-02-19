import Admin from '../models/adminModel.js'
import securePassword from '../utils/securePassword.js'
import ErrorHandler from '../utils/ErrorHandler.js'
import sendMail from '../utils/sendMail.js'
import bcrypt from 'bcrypt'
import JwtService from '../utils/JwtService.js'
import RefreshToken from '../models/refreshTokenModel.js'

const registerAdmin = async (req, res, next) => {
    const { user_name, email, phone_number, password } = req.body

    const existingEmail = await Admin.exists({ email })
    if (existingEmail) {
        return next(new ErrorHandler("Email is Already in Use", 400))
    }

    const existingNumber = await Admin.exists({ phone_number })
    if (existingNumber) {
        return next(new ErrorHandler("Phone Number is Already in Use", 400))
    }

    const existingName = await Admin.exists({ user_name })
    if (existingName) {
        return next(new ErrorHandler("User Name is Already in Use", 400))
    }

    const spassword = await securePassword(password)

    const admin = await Admin.create({
        user_name,
        email,
        phone_number,
        password: spassword
    })

    try {
        let adminData = await admin.save();

        if (!adminData) {
            return next(new ErrorHandler("Your registration has been failed", 404));
        }

        const message = ` Hii ${user_name}, please click here http://localhost:8000/api/v1/verify?id=${adminData._id} to Verify Your mail.`;
        await sendMail({
            email: admin.email,
            subject: `Verify Your Mail`,
            message
        });

    } catch (error) {
        return next(error);
    }

    res.status(200).json({
        success: true,
        message: "Your registration has been successfully,please verify your mail"
    });
}

export const loginAdmin = async (req, res, next) => {
    const { user_name, password } = req.body

    if (!user_name || !password) {
        return next(new ErrorHandler("Please Enter User Name and Password", 400));
    }

    const admin = await Admin.findOne({ user_name }).select("+password");
    if (!admin) {
        return next(new ErrorHandler("Invalid user_name or password", 401));
    }

    const isPasswordMatched = await bcrypt.compare(password, admin.password)
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid user_name or password", 401));
    }
    if (admin.is_verified === false) {
        return next(new ErrorHandler("Email Is Not Verified Please Verify Email", 420));
    }

    const access_token = JwtService.sign({ _id: admin._id, role: admin.role });
    const refresh_token = JwtService.sign({ _id: admin._id, role: admin.role }, '1y', process.env.REFRESH_TOKEN);
    const refreshToken = await RefreshToken.create({ token: refresh_token });
    await refreshToken.save();
    res.cookie("JWToken", { access_token, refresh_token }, {
        expires: new Date(Date.now() + 3600000),
        httpOnly: true,
    })
    res.status(200).json({
        success: true,
        message: "Log in Successful..!",
        access_token,
        refresh_token
    });
}

export const dashboard = async (req, res, next) => {
    try {
        const admin = await Admin.findOne({ _id: req.admin._id }).select("-password -__v -_id -is_verified")
        if (!admin) {
            return next(new ErrorHandler("Not Found", 404));
        }
        res.json(admin);
    } catch (error) {
        return next(error);
    }
}

export const refresh = async (req, res, next) => {
    let refreshToken;
    try {
        refreshToken = await RefreshToken.findOne({ token: req.body.refresh_token })
        if (!refreshToken) {
            return next(new ErrorHandler('Invalid Refresh Token', 401))
        }

        let adminId
        try {
            const { _id } = JwtService.verify(refreshToken.token, process.env.REFRESH_TOKEN)

            adminId = _id
        } catch (error) {
            return next(new ErrorHandler('Invalid Refresh Token', 401));
        }

        const admin = await Admin.findOne({ _id: adminId })
        if (!admin) {
            return next(new ErrorHandler('No Admin Found', 401));
        }

        const access_token = JwtService.sign({ _id: admin._id, role: admin.role });
        const refresh_token = JwtService.sign({ _id: admin._id, role: admin.role }, '1y', process.env.REFRESH_TOKEN);

        const rToken = await RefreshToken.create({ token: refresh_token });
        await rToken.save();

        res.status(200).json({
            access_token,
            refresh_token
        });

    } catch (error) {
        return next(error)
    }
}

export const signout = async (req, res, next) => {
    try {
        await RefreshToken.deleteOne({ token: req.body.refresh_token });
    } catch (error) {
        return next(new Error('Something Went Wrong In The Database', 500))
    }

    res.clearCookie("JWToken");
    res.status(200).json({
        message: "Signout Successful..!"
    });
}

export default registerAdmin