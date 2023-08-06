const website_name = "Kiripedia";

// Please set your logo location to path "./public/images", you can also use a web url, such like:
// https://static.amekiri.com/images/logo.svg
const website_logo = "/images/logo.png";

// If you are using mysql8, please set this value to 2 because mysql has changed the encryption mode to caching_sha2_password
// or change the mysql encryption mode to mysql_native_password instead caching_sha2_password
const mysql_type = 2;

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

const cookie_max_age = 36000000;

const cookie_domain = "";

const token_secret = "MYTOKENSECRET";

const robots_txt = `User-agent: *\n` +
                    `Disallow: /api\n` +
                    `Disallow: /api-doc`;

const image_path = './public/images/useravatar';
const image_uri = '/images/useravatar';

module.exports = {website_name, website_logo, withCDN, mysql, mysql_type, token_secret, cookie_max_age, cookie_domain, robots_txt, image_path, image_uri}