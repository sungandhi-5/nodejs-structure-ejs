require("dotenv").config();

module.exports = {
   PLATFORM_NAME: "Node Bootstrap",
   SUPPORT_EMAIL: "support@bootstrap.com",
   

   AUTH_TOKEN_STATUS: 0,
   ACCOUNT_ACTIVATION_TOKEN_STATUS: 1,
   FORGETPASS_TOKEN_STATUS: 2,
   OTP_TOKEN: 3,
   EXTERNAL_ADDRESS_TOKEN: 4,
   REFUND_REQ_TOKEN: 5,

   TOKEN_TYPE : {
      AUTH : 0,
   },


   STORAGE_USER_PATH: "assets/images/merchant/",

   AUTH_TOKEN_LENGTH: 15,
   CLEANUP_LOGS_INTERVAL : 7, // in days
};
