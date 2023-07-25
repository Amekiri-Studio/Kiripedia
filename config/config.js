const website_name = "Kiripedia";

// Please set your logo location to path "./public/images", you can also use a web url, such like:
// https://static.amekiri.com/images/logo.svg
const website_logo = "/images/logo.png";

// If your website is using CDN that only can get CDN's IP instead user's ip, please set this value to "true"
// And please set some headers on your proxy server, suck like Nginx:
/*
* proxy_set_header Host $host;
* proxy_set_header Ali-CDN-Real-IP $remote_addr;
* proxy_set_header REMOTE-HOST $remote_addr;
* proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
*/
const withCDN = false;

const mysql = require('mysql');

module.exports = {website_name, website_logo, withCDN, mysql}