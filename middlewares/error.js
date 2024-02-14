import ErrorHandler from "../utils/ErrorHandler.js"



export default (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal server error";

    // Wrong Mongodb Id error  
    if (err.name === "CastError") {
        const message = `Resource not found, Invalid: ${err.path}`;
        err = new ErrorHandler(message, 404);
    }

    // MongoDB Duplicate Error Key
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
        err = new ErrorHandler(message, 404);
    }

    // Wrong JWT Error  
    if (err.name === "jsonWebTokenError") {
        const message = `Json Web Token is invalid, try again`;
        err = new ErrorHandler(message, 404);
    }

    // JWT Expire Error 
    if (err.name === "TokenExpireError") {
        const message = `Json Web Token is Expire, Try again`;
        err = new ErrorHandler(message, 404);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};