const UserModel = require('../model/user.model');
const myCrypt = require('../utils/lib/mycrypt.lib')
const constants = require("../config/constants");
const Generallib = require("../utils/lib/general.lib");
const { error_log, debug_log } = require("../utils/lib/log.lib");
const UserTokenModel = require('../model/userToken.model')

class AuthController {
    getLogin = async (req, res) => {
        try {
            if (req.session.user) {
                return res.redirect('/user/dashboard');
            }
            return res.render('user/login', {
                header: {
                    title: 'Login | ' + constants.PLATFORM_NAME,
                },
                body: {}
            })

        } catch (error) {
            error_log('getLogin Error:', error);
            return res.render('error/500');
        }
    }

    postLogin = async (req, res) => {
        try {
            const Ip = Generallib.getIp(req);
            const { email, password, rememberMe } = req.body;
            let userExist = await UserModel.findOne({ email: email },[],'+password');

            if (!userExist) {
                throw "Invalid email or password";
            }
            const matchPassword = myCrypt.check(password, userExist.password);
            if (!matchPassword) {
                throw "Invalid email or password";
            }
            if (rememberMe) {
                req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 365;  // For 1 Year
            }
            else {
                req.session.cookie.expires = false; // When the user closes the browser 
            }

            userExist = userExist.toObject();
            delete userExist.password;
            req.session.user = userExist;
            const createData = {
                user_id: userExist._id,
                userAgent: req.get("User-Agent"),
                ipAddress: Generallib.getIp(req),
                type: constants.TOKEN_TYPE.AUTH,
                token: userExist.remember_token
            }
            const userTokenExist = await UserTokenModel.findOne({ ipAddress: Generallib.getIp(req), userAgent: req.get("User-Agent")});
            if (!userTokenExist) {
                await UserTokenModel.createOne(createData)
            }
            return res.json(Generallib.success_res("User login successfully"));
        } catch (error) {
            error_log("Post Login Error:", error);
            return res.json(Generallib.error_res(error));
        }
    }
    
    getSignup = async (req, res) => {
        try {
            if (req.session.user) {
                return res.redirect('/user/dashboard');
            }
            return res.render('user/signup', {
                header: {
                    title: "Signup | "+ constants.PLATFORM_NAME,
                },
                body: {}
            })

        } catch (error) {
            error_log('getSignup Error:', error);
            return res.render('error/500');
        }
    }

    postSignup = async (req, res) => {
        try {
            const Ip = Generallib.getIp(req);
            const { username, email, password, confirm_password } = req.body;
            let userExist = await UserModel.findOne({$or:[{ email: email},{username:username }]});

            if (userExist) {
                throw "User account already registered!";
            }
            if (password != confirm_password) {
                throw "Password and confirm password should be same.";
            }

            await UserModel.createOne({
                username,email,password
            })
            
            return res.json(Generallib.success_res("User register successfully", {
                user: userExist,
            }));
        } catch (error) {
            error_log("Post Login Error:", error);
            return res.json(Generallib.error_res(error));
        }
    }

    getLogOut = async (req, res) => {
        try {
            const delete_login_token = await UserTokenModel.deleteOne({
                user_id:req.session.user._id,
                type:constants.TOKEN_TYPE.AUTH,
                ipAddress:Generallib.getIp(req),
                userAgent:req.get("User-Agent")
            });
            debug_log(['delete_login_token : ',delete_login_token])
            if (delete_login_token.flag === 1) {
                delete req.session.user;
                return res.redirect("/");
            }

        } catch (error) {
            error_log("Logout Error:", error);
            return res.redirect('/user/dashboard');
        }
    }
}

module.exports = new AuthController();