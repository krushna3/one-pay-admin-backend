import ErrorHandler from "../utils/ErrorHandler.js"
import JwtService from "../utils/JwtService.js"

const auth = (req, res, next) => {

    let authHeader = req.headers.authorization;

    if (!authHeader) {
        return next(new ErrorHandler('UnAuthorized'));
    }

    const token = authHeader.split(' ')[1];

    try {

        const { _id, role } = JwtService.verify(token);

        const admin = {
            _id,
            role
        };
        req.admin = admin;

        next();

    } catch (error) {
        return next(new ErrorHandler('UnAuthorized'));
    }

}

export default auth