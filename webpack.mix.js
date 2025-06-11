let mix = require('laravel-mix');

mix
  .js(['./src/resources/assets/js/user/login.js'],
    './assets/js/user/login.min.js')
  .js(['./src/resources/assets/js/user/signup.js'],
    './assets/js/user/signup.min.js')
  .js(['./src/resources/assets/js/user/dashboard.js'],
    './assets/js/user/dashboard.min.js')
  .styles([
    './src/resources/assets/css/all.css',
    './src/resources/assets/css/bootstrap.css',
    './src/resources/assets/css/user/theme.css',
    './src/resources/assets/css/user/style.css',
    './src/resources/assets/css/jquery-ui.css'
  ], 'assets/css/common.min.css')