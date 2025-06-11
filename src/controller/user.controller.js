const constants = require("../config/constants");

class UserController {

    getDashBoard = (req, res) => {
        return res.render('user/dashboard', {
            header: {
                title: `Dashboard | ${constants.PLATFORM_NAME}`,
                name: req.session.user.username,
                email: req.session.user.email,
                js: [],
                css: [],
                pageLink: [
                    { Home: "Dashboard" },
                    { Page: "" },
                    { Page2: "" }
                ],
                platform: constants.PLATFORM_NAME
            },
            body: {
                id: 'dashboard',
                title: 'Dashboard',
            },
            footer: {
                js: ['/user/dashboard.min.js'],
                css: [],
            },
        });
    }
}

module.exports = new UserController();