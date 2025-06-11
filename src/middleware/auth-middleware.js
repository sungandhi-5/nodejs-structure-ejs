const General = require("../utils/lib/general.lib");
const constants = require("../config/constants");
const UserTokenModel = require("../model/userToken.model");
const { debug_log } = require("../utils/lib/log.lib");

const sessionChecker = async (req, res, next) => {
    if (!req.session.user) {
        await UserTokenModel.deleteOne({ipAddress:General.getIp(req),userAgent:req.get('User-Agent')});
        res.redirect("/");
        return;
    }
    const user = req.session.user
    if (user != null) {
        let findArray = {
            user_id: req.session.user._id,
            ip: General.getIp(req),
            ua: req.get("User-Agent"),
            type: constants.TOKEN_TYPE.AUTH,
        }
        
        let userToken = await UserTokenModel.findOne({ user_id: findArray.user_id, ipAddress: findArray.ip, userAgent: findArray.ua, type: findArray.type });
        if(!userToken){
            delete req.session.user;
            res.redirect("/");
            return;
        }
    }

    next();
};

module.exports = {
    sessionChecker,
}