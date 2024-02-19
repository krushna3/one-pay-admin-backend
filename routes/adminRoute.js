import express from 'express'
import registerAdmin, { loginAdmin, refresh, signout } from '../controllers/adminControllers.js'
import verifyMail from '../utils/verifyMail.js';
import { dashboard } from '../controllers/adminControllers.js';
import auth from '../middlewares/auth.js';
import isAdmin from '../middlewares/isAdmin.js';
const router = express.Router();


router.route("/signup").post(registerAdmin)
router.route("/verify").get(verifyMail)
router.route("/signin").post(loginAdmin)
router.route('/dashboard').get(auth, isAdmin, dashboard)
router.route("/refresh").post(refresh)
router.route("/signout").post(auth, signout)

export default router