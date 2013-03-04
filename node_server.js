var redis = require("redis"),
	sys = require ('sys'),
	url = require('url'),
	http = require('http'),
	qs = require('querystring'),
	express = require('express'),
	stylus = require('stylus'), 
	nib = require('nib'), 
	Twitter = require('./model/twitter'),
	Controller = require('./model/controller'),
	CryptoJS = require('./node_modules/cryptojs/cryptojs');


global.client = redis.createClient();
client.on("error", function (err) {
	console.log("Error " + err);
});

global.twitter = new Twitter('iPtj8HxKQ10kLzohqEM8Xg', '8eFKkw78W8KEjsNlxcalu5tvHPDdgsQfrC79EVgKk', '40023277-rRpv7QzUQ7wfFrPmYxuCDRuTNNAPUYBd4m6ogFZK4', 'srjptlwRGT95pHLFUiiKkukNTJT8Kycs9IG6vs8JGKI');

var main_controller = new Controller();
global.CryptoJS = CryptoJS;

var app = express()
function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib())
}
app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(express.logger('dev'))
app.use(stylus.middleware(
  { src: __dirname + '/public'
  , compile: compile
  }
))
app.use(express.static(__dirname + '/public'))

app.get('/', main_controller.homepage);

app.listen(1337);
console.log('Listening on port 1337');