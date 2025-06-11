const moment = require('moment');
const useragent = require('useragent');
const { debug_log, error_log, http_log, silly_log } = require('./log.lib');
const constants = require('../../config/constants');
const FormData = require('form-data')
const axios = require('axios');
const cache = require("../../config/cache");

class General {
   success_res = (msg = "", data = {}) => {
      var res = { flag: 1 };
      res.msg = msg;
      res.data = data;
      return res;
   };
   invalid_token = (msg = "", data = {}) => {
      var res = { flag: 4 };
      res.msg = msg;
      res.data = data;
      return res;
   };
   Fa2Success_res = (msg = "", data = {}) => {
      var res = { flag: 3 };
      res.msg = msg;
      res.data = data;
      return res;
   };

   isValidIp = (ip) => {
      const ipAddressRegex = /^(\d{1,3}\.){3}(\d{1,3})$/;
      return ipAddressRegex.test(ip);
   }

   isValidDomain = (domain) => {
      const domainNameRegex = /^((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,6}$/;
      return domainNameRegex.test(domain);
   }

   hasScriptWord = (str = '') => {
      if (str === '' || str.includes('script')) {
         return true;
      }
      return false;
   }

   getIpByDomainName = async (domainName) => {
      let ip = false;
      if (domainName !== '') {
         try {
            const response = await axios.get(`http://ip-api.com/json/${domainName}`);
            const data = response.data;
            if (data.status && data.status.toLowerCase() === 'success') {
               ip = data.query;
            }
         } catch (error) {
            error_log('Error occurred while fetching data:', error);
         }
      }
      return ip;
   }

   error_res = (msg = "", data = {}) => {
      var res = { flag: 0 };
      res.msg = msg.length == 0 ? "Error" : msg;
      res.data = data;
      return res;
   };

   auth_error = (msg = "", data = {}) => {
      var res = { flag: 8 };
      res.msg = msg.length == 0 ? "Unauthorized Token" : msg;
      res.data = data;
      return res;
   };
   session_expired = (msg = "", data = {}) => {
      var res = { flag: 8 };
      res.msg = msg.length == 0 ? "Unauthorized Token" : msg;
      res.data = data;
      return res;
   };
   getIp = (req) => {
      const ip = req.headers['cf-connecting-ip'] ? req.headers['cf-connecting-ip'] : req.connection.remoteAddress;
      const parts = ip.split('::ffff:');
      return parts.length > 1 ? parts[1] : parts[0];
   }

   checkExtraFields = (fields, requestBody) => {
      const extraFields = Object.keys(requestBody).filter(field => !fields.includes(field));
      if (extraFields.length > 0) {
         const extraFieldNames = extraFields.join(', ');
         throw new Error(`${extraFieldNames} Not allowed`);
      }
   }

   DateInHumanReadleFormat = (date) => {
      let currentDate = moment.utc();
      const formattedCurretDatetime = currentDate.toISOString();
      currentDate = moment(formattedCurretDatetime).utc();
      const targetDate = moment(date).utc();
      const secondDifference = currentDate.diff(targetDate, 'seconds');
      if (secondDifference < 60) {
         return `${secondDifference} ${'seconds ago'}`;
      } else if (secondDifference > 60 && secondDifference < 3600) {
         const minDifference = Math.floor(secondDifference / 60);
         return `${minDifference} ${'minutes ago'}`;
      } else if (secondDifference > 3600 && secondDifference < 86400) {
         const hourDifference = Math.floor(secondDifference / 3600);
         return `${hourDifference} ${'hours ago'}`;
      } else if (secondDifference > 86400 && secondDifference < 604800) {
         const dayDifference = Math.floor(secondDifference / 86400);
         return `${dayDifference} ${'days ago'}`;
      } else if (secondDifference > 604800 && secondDifference < 2592000) {
         const weeksDifference = Math.floor(secondDifference / 604800);
         return `${weeksDifference} ${weeksDifference > 1 ? `${'weeks'}` : `${'week'}`} ${'ago'}`;
      } else if (secondDifference > 2592000 && secondDifference < 31104000) {
         const yearDifference = Math.floor(secondDifference / 2592000);
         return `${yearDifference} ${yearDifference > 1 ? `${'month'}` : `${'months'}`} ${'ago'}`;
      } else if (secondDifference > 31104000) {
         const yearDifference = Math.floor(secondDifference / 31104000);
         return `${yearDifference} ${yearDifference > 1 ? `${'year'}` : `${'years'}`} ${'ago'}`;
      } else {
         const monthsDifference = Math.floor(secondDifference / 30);
         return `${monthsDifference} ${monthsDifference > 1 ? `${'months'}` : `${'month'}`} ${'ago'}`;
      }
   };

   DateInTooltipFormatter = (date) => {
      let currentDate = moment(date).utc();
      const formattedDate = currentDate.format('YYYY-MM-DD HH:mm:ss') + ' (UTC)';



      return formattedDate;
   }
   DateFormatter = (date) => {
      let currentDate = moment(date)
      const formattedDate = currentDate.format('YYYY-MM-DD HH:mm:ss')
      return formattedDate;
   }
   ExpireDateInHumanReadleFormat = (date) => {
      let currentDate = moment.utc();
      const formattedCurretDatetime = currentDate.toISOString();
      currentDate = moment(formattedCurretDatetime).utc();
      const targetDate = moment(date).utc();
      const isPast = targetDate.isSameOrBefore(currentDate);
      const timeDifference = isPast ? currentDate.diff(targetDate, 'seconds') : targetDate.diff(currentDate, 'seconds');
      const timeUnits = [
         { unit: 'year', factor: 31104000 },
         { unit: 'month', factor: 2592000 },
         { unit: 'week', factor: 604800 },
         { unit: 'day', factor: 86400 },
         { unit: 'hour', factor: 3600 },
         { unit: 'minute', factor: 60 },
         { unit: 'second', factor: 1 },
      ];

      for (const { unit, factor } of timeUnits) {
         const unitDifference = Math.floor(timeDifference / factor);
         if (timeDifference >= factor) {
            return isPast
               ? `${unitDifference} ${unitDifference > 1 ? `${unit}s Ago` : `${unit} Ago`}`
               : `After ${unitDifference} ${unitDifference > 1 ? `${unit}s` : `${unit}`}`;
         }
      }

      return 'Just now';
   }

   cdnPathUrl = (fileName = '', path = '') => {
      return process.env.CDN_URL + path + fileName;
   }

   pathUrl = (fileName = '', path = '') => {
      return process.env.NODE_URL + path + fileName;
      let fileDriver = process.env.FILESYSTEM_DRIVER || 'local';
      if (fileDriver == 's3') {
         return process.env.AWS_URL + path + fileName;
      } else {
      }
   }

   getCoinImage = (coin_name = '', size = '') => {
      if (size == '') {
         // let coinImage = this.pathUrl(coin_name + constants.IMAGE_EXTENSIONS, constants.COIN_AVATAR_PATH);
         let coinImage = this.pathCdnFile(constants.COIN_AVATAR_PATH + coin_name + constants.IMAGE_EXTENSIONS);
         return coinImage;
      } else {
         // let coinImage = this.pathUrl(coin_name + constants.IMAGE_EXTENSIONS, constants.COIN_AVATAR_PATH + size + 'x' + size + '/');
         let coinImage = this.pathCdnFile(constants.COIN_AVATAR_PATH + size + 'x' + size + '/'+coin_name + constants.IMAGE_EXTENSIONS);
         return coinImage;
      }
   };

   pathCdnFile = (path = '') => {
      return process.env.CDN_URL + path;
   };

   getBrowser = (userAgentString) => {
      let agent = useragent.parse(userAgentString);
      let platform = agent.os.family || 'Unknown';

      let name = agent.family || 'Unknown';
      if (agent.source.includes("Edg")) {
         name = "Edge";
      }
      let version = agent.toVersion() || '?';

      return {
         userAgent: userAgentString,
         name,
         version,
         platform
      };
   };
   generateQrForAddress(string, size = 200) {
      // // return 'https://chart.googleapis.com/chart?chs=' + size + 'x' + size + '&chld=L|2&cht=qr&chl=' + string;
      return 'https://quickchart.io/qr?margin=1&size=' + size + '&text=' + string;
      // return 'https://api.qrserver.com/v1/create-qr-code/?size=' + size + 'x' + size + '&data=' + string + '&format=svg';
   };
   validation_res = (msg = "", data = {}) => {
      var res = { flag: 2 };
      res.msg = msg.length == 0 ? "Validation Error" : msg;
      res.data = data;
      return res;
   };
   number_format(number, decimals, decPoint, thousandsSep) {
      // Validate the input
      if (isNaN(number) || number === '' || number === null) return '';

      // Set default values if not provided
      decimals = decimals || 0;
      decPoint = decPoint || '.';
      thousandsSep = thousandsSep || ',';

      // Parse the number and perform formatting
      let parts = parseFloat(number).toFixed(decimals).split('.');
      let value = parts[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
      let formattedNumber = decimals > 0 ? value + decPoint + parts[1] : value;

      return formattedNumber;
   };
   ucwords(str) {
      return str.replace(/\b\w/g, function (char) {
         return char.toUpperCase();
      });
   };
   bnAdd(amount1, amount2, decimal) {
      var a = new BN(amount1);
      var b = new BN(amount2);
      if (decimal != 0) return a.plus(b).toFixed(decimal)

      return a.plus(b).toFixed()
   };

   bnMulDecimals(amount, decimals) {
      let a = new BN(amount);
      let base = new BN(10);
      let b = base.pow(decimals);

      return a.multipliedBy(b).toFixed()
   };

   bnConvertToWithdrawAmt(amount, decimals) {
      let a = new BN(amount);
      a = a.toFixed(8);
      let base = new BN(10);
      let b = base.pow(decimals);

      return BN(a).multipliedBy(b).toFixed()
   };

   bnMul(amount1, amount2, decimal = 0) {
      let a = new BN(amount1);
      let b = new BN(amount2);
      if (decimal != 0) return a.multipliedBy(b).toFixed(decimal)

      return a.multipliedBy(b).toFixed()
   };

   bnDivDecimals(amount, decimals) {
      var a = new BN(amount);
      let base = new BN(10);
      let b = base.pow(decimals);

      return a.div(b).toFixed();
   };

   bnDiv(amount1, amount2, decimal = 0) {
      var a = new BN(amount1);
      let b = new BN(amount2);
      if (decimal != 0) return a.div(b).toFixed();

      return a.div(b).toFixed(decimal)
   };

   bnToFixed(amount, decimals) {
      var a = new BN(amount);
      return a.toFixed(decimals);
   };
   sunToTrx(amount) {
      return this.bnDiv(amount, 1000000, 8);
   };
   JsontoFormData = (obj) => {
      this.formData = new FormData();

      this.createFormData = function (obj, subKeyStr = '') {
         for (let i in obj) {
            let value = obj[i];
            let subKeyStrTrans = subKeyStr ? subKeyStr + '[' + i + ']' : i;

            if (typeof (value) === 'string' || typeof (value) === 'number') {
               this.formData.append(subKeyStrTrans, value);
            } else if (typeof (value) === 'object') {
               this.createFormData(value, subKeyStrTrans);
            }
         }
      }

      this.createFormData(obj);

      return this.formData;
   };

   notifyAxiosCall = async (url, post = { ping: 'site' }, headers = {}) => {
      try {
         debug_log('post: -', url);

         const form = new FormData();
         const formData = this.JsontoFormData(post);
         const response = await axios.post(url, formData, {
            headers: {
               ...form.getHeaders(),
               "Accept": '*/*',
               ...headers,
            },
            timeout: constants.NOTIFY_CURL_CONNECTIONTIMEOUT, // Replace with the desired timeout value
         })
         const httpCode = response.status;
         debug_log('http code: -', httpCode);

         const res = {
            status_code: httpCode,
            data: JSON.stringify(response.data),
            headers: response.headers,
         };

         if (httpCode === 200) {
            http_log('Request was successful.');
            return res;
         } else {
            http_log('Request failed with status code:', httpCode);
            return res;
         }
      } catch (error) {
         error_log('(notifyCurlCall) => exception');
         error_log(JSON.stringify(error));
         let err = JSON.parse(JSON.stringify(error))

         const res = {
            status_code: err.status ? err.status : 0,
            data: err.message ? JSON.stringify(err.message) : 'something went wrong!',
            headers: (err.config && err.config.headers) ? err.config.headers : {},
         };
         return res;
      }
   };
   isValidValue = (value) => {
      return value !== null && value !== undefined && value !== '';
   }
   generateFileName = (extension) => {
      const randomDigits = Math.floor(10000 + Math.random() * 90000); // Generate random 5-digit number
      const timestamp = new Date().getTime(); // Get current timestamp
      return `${randomDigits}_${timestamp}.${extension}`;
   };
   generateRandomToken = (length) => {
      let result = '';
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for (let i = 0; i < length; i++) {
         result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return result;
   }
   ConvertNumberHumanReadable = (number, decimal = 2) => {
      let num = new BN(number);
      const trillion = new BN(1e12);
      const billion = new BN(1e9);
      const million = new BN(1e6);
      const thousand = new BN(1e3);

      if (num.gte(trillion)) {
         return num.dividedBy(trillion).toFixed(2) + ' Trillion';
      } else if (num.gte(billion)) {
         return num.dividedBy(billion).toFixed(2) + ' B';
      } else if (num.gte(million)) {
         return num.dividedBy(million).toFixed(2) + ' M';
      } else if (num.gte(thousand)) {
         return num.dividedBy(thousand).toFixed(2) + ' K';
      } else {
         return num.toFixed(decimal);
      }
   };
   getFormattedNumber = (number) => {
      let stringNumber = number.toString();
      let [integerPart, decimalPart] = stringNumber.split('.');
      let roundedNumberString = integerPart;

      if (decimalPart != undefined) {
         // let trimmedDecimalLength = decimalPart.replace(/0+$/, '').length;
         let trimmedDecimalLength = 6;
         roundedNumberString = trimmedDecimalLength > 0 ? `${integerPart}.${decimalPart.slice(0, trimmedDecimalLength)}` : integerPart;
      }

      return parseFloat(roundedNumberString);
   };
   validateURL(url) {
      const pattern = /\b(?:(?:https?|ftp):\/\/|www\.)[-a-z0-9+&@#\/%?=~_|!:,.;]*[-a-z0-9+&@#\/%=~_|]/i;
      if (pattern.test(url)) {
         if (process.env.NODE_ENV === 'local') // Assuming 'local' is your local environment
            return true;

         if (url.includes('localhost') || url.includes('127.0.0.1'))
            return false;
      } else {
         return false;
      }
      return true;
   }
   getBrowserIcon(broswer_name_format) {
      if (broswer_name_format == "chrome" || broswer_name_format == "chrome_mobile" || broswer_name_format == "samsung_internet")
         return "<i class='fab fa-chrome text-2xl text-amber-500'></i>";
      else if (broswer_name_format == "firefox" || broswer_name_format == "firefox_mobile")
         return '<i class="fab fa-firefox text-2xl text-amber-500"></i>';
      else if (broswer_name_format == "safari" || broswer_name_format == "mobile_safari")
         return '<i class="fab fa-safari text-2xl text-amber-500"></i>';
      else if (broswer_name_format == "opera")
         return '<i class="fab fa-opera text-2xl text-amber-500"></i>';
      else if (broswer_name_format == "edge")
         return '<i class="fab fa-edge text-2xl text-amber-500"></i>';
      else
         return '<i class="fas fa-exclamation-triangle text-2xl text-amber-500"></i>';
   }
   hexToAddress(hexString) {
      // let address = hexString.replace('0x', '');
      const zeroPattern = /^0x0+/;
      let address = hexString.replace(zeroPattern, "0x");
      // address = '0x' + address
      return address;
   }

   resizeAndUpload = async (image, path, size, file_name) => {
      try {
         const maxSize = parseInt(size);

         const resizedBuffer = await sharp(image.data)
            .resize({ width: maxSize, height: maxSize })
            .toBuffer();

         debug_log(`Resized image for size ${size}x${size}`, path, image);

         this.uploadFileImageToCdn(resizedBuffer.toString('base64'), path, file_name);
         // await fileStorage.uploadFile(image, resizedBuffer, path);
      } catch (error) {
         error_log(`Error resizing or uploading image for size ${size}x${size}:`, error);
         throw error;
      }
   }

   getTimeSlots(dateString, duration) {
      const today = moment().startOf('day'); // Get today's date at midnight
      const providedDate = moment(dateString);
      if (providedDate.isSame(today, 'day')) {
         // Today's date: Get slots until current time
         const now = moment();
         const slots = [];
         let current = moment(today);
         while (current.isBefore(now)) { // Check against current time
            const startTime = current.format('HH:mm');
            current.add(duration, 'minutes'); // Add 30 minutes to current time
            const endTimeSlot = current.format('HH:mm');
            slots.push({ start: startTime, end: endTimeSlot });
         }
         return slots;
      } else {
         // Not today's date: Get slots for the whole day
         const slots = [];
         let current = moment(providedDate).startOf('day');
         const endTime = moment(providedDate).endOf('day');

         while (current.isBefore(endTime)) {
            const startTime = current.format('HH:mm')
            current.add(duration, 'minutes'); // Add duration to current time
            const endTimeSlot = current.isAfter(endTime) ? endTime.format('HH:mm') : current.format('HH:mm');
            slots.push({ start: startTime, end: endTimeSlot });
         }
         return slots;
      }
   }

   isObjectEmpty(obj) {
      return JSON.stringify(obj) === '{}';
   }
   ConvertNumberToShort = (number) => {
      let num = new BN(number);
      const trillion = new BN(1e12);
      const billion = new BN(1e9);
      const million = new BN(1e6);
      const thousand = new BN(1e3);

      if (num.gte(trillion)) {
         return num.dividedBy(trillion).toFixed(2) + ' Trillion';
      } else if (num.gte(billion)) {
         return num.dividedBy(billion).toFixed(2) + ' B';
      } else if (num.gte(million)) {
         return num.dividedBy(million).toFixed(2) + ' M';
      } else if (num.gte(thousand)) {
         return num.dividedBy(thousand).toFixed(2) + ' K';
      } else {
         return num.toFixed(2);
      }
   };

   nl2br = (str, is_xhtml) => {
      if (typeof str === 'undefined' || str === null) {
         return '';
      }
      var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
      return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
   }

   deleteFromCache = async (type, coin, rpc, address) => {
      if (coin == constants.ETH || coin == constants.USDTERC20 || coin == constants.BNB) {
         address = address.toLowerCase();
      }
      return await cache.LREM(`${type}_${coin}${constants.CACHE_SEPARATOR}${rpc}`, 1, address);
   }

   deleteWholeCache = async (type, coin, rpc) => {
      return await cache.DEL(`${type}_${coin}${constants.CACHE_SEPARATOR}${rpc}`);
   }

   addToCache = async (type, coin, rpc, address) => {
      if (coin == constants.ETH || coin == constants.USDTERC20 || coin == constants.BNB) {
         address = address.toLowerCase();
      }
      debug_log('Key : ', `${type}_${coin}${constants.CACHE_SEPARATOR}${rpc}`, address)
      return await cache.LPUSH(`${type}_${coin}${constants.CACHE_SEPARATOR}${rpc}`, address);
   }

   getAddressCache = async (type, coin, rpc, start, end) => {
      return await cache.LRANGE(`${type}_${coin}${constants.CACHE_SEPARATOR}${rpc}`, start, end);
   }
   getAddressCacheCount = async (type, coin, rpc) => {
      return await cache.LLEN(`${type}_${coin}${constants.CACHE_SEPARATOR}${rpc}`);
   }

   checkAddressCache = async (type, coin, rpc, address) => {
      if (coin == constants.ETH || coin == constants.USDTERC20 || coin == constants.BNB) {
         address = address.toLowerCase();
      }
      return await cache.LPOS(`${type}_${coin}${constants.CACHE_SEPARATOR}${rpc}`, address);
   }

   HtmlToImage = async (html, path, thumbFileName, hasItage) => {
      // Launch a headless browser instance
      const browser = await puppeteer.launch({ headless: "true", args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      const page = await browser.newPage();

      // Get the content height dynamically
      const contentHeight = await page.evaluate(() => { return document.documentElement.scrollHeight - 10; });
      await page.setViewport({ width: 1920, height: contentHeight });

      let thumbnailHTML = `
         <!DOCTYPE html>
         <html lang="en">
         <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Template HTML</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
            <style>
               body {
                  margin: 0;
               }
            </style>
         </head>
         <body>
            ${html}
         </body>
         </html>
      `;

      await page.setContent(thumbnailHTML);

      if (hasItage) {
         // Wait for all fonts and icons to load
         await page.evaluateHandle('document.fonts.ready');

         // Wait for any dynamically rendered icons
         await page.waitForSelector('i');
      }

      // Take a screenshot
      const screenshotBase64 = await page.screenshot({ type: 'png', fullPage: true, encoding: 'base64' });

      // Close the browser
      await browser.close();

      // Upload the image
      this.uploadFileImageToCdn(screenshotBase64, path, thumbFileName);

      return true;
   };

   uploadFileImageToCdn = async (image, path, fileName) => {
      try {
         let formData = new FormData();
         const buffer = Buffer.from(image, 'base64');
         formData.append('image', buffer, { filename: fileName });
         formData.append('path', path);
         formData.append('file_name', fileName);
         const cdnUrl = process.env.CDN_URL + 'image/upload';
         const axiosRes = await axios.post(cdnUrl, formData, {
            headers: {
               'Content-Type': 'multipart/form-data',
               'X-Auth-Token': process.env.CDN_AUTH_TOKEN
            }
         })
            .then(response => {
               debug_log(response.data); // Handle successful upload response
               return true;
            })
            .catch(error => {
               error_log("uploadFileImageToCdn error : ", error); // Handle upload errors
               return false;
            });
         return axiosRes;
      } catch (error) {
         error_log('Error reading image dimensions:', error);
         return false;
      }
   }
   copyFileImageToCdn = (from, to) => {
      try {
         const cdnUrl = process.env.CDN_URL + 'image/copy';
         axios.post(cdnUrl, { from, to }, {
            headers: {
               'Content-Type': 'application/json',
               'X-Auth-Token': process.env.CDN_AUTH_TOKEN
            }
         })
            .then(response => {
               debug_log(response.data); // Handle successful upload response
            })
            .catch(error => {
               error_log("copyFileImageToCdn error :", error); // Handle upload errors
            });

         return true;
      } catch (error) {
         error_log('Error reading image dimensions:', error);
         return false;
      }
   }
   deleteFileImageFromCdn = (path, delete_dir = false) => {
      try {
         const cdnUrl = process.env.CDN_URL + 'image/delete';
         axios.post(cdnUrl, { path, delete_dir }, {
            headers: {
               'Content-Type': 'application/json',
               'X-Auth-Token': process.env.CDN_AUTH_TOKEN
            }
         })
            .then(response => {
               silly_log(response.data); // Handle successful upload response
            })
            .catch(error => {
               error_log("deleteFileImageFromCdn error : ", error); // Handle upload errors
               return false;
            });

         return true;
      } catch (error) {
         error_log('Error reading image dimensions:', error);
         return false;
      }
   }
}

module.exports = new General();
