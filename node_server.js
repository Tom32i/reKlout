var sys = require ('sys'),
	url = require('url'),
	http = require('http'),
	qs = require('querystring'),
	express = require('express'),
	stylus = require('stylus'), 
	nib = require('nib'), 
	redis = require("redis"),
	Twitter = require('./model/twitter'),
	Controller = require('./model/controller'),
	CryptoJS = require('./node_modules/cryptojs/cryptojs');

global.config = require('./config.js');
global.client = redis.createClient();
client.on("error", function (err) {
	console.log("Error " + err);
});

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
app.use(express.cookieParser());
app.use(express.session({
	secret: config.secret,
	// Internal session data storage engine, this is the default engine embedded with connect.
	// Much more can be found as external modules (Redis, Mongo, Mysql, file...). look at "npm search connect session store"
	store:  new express.session.MemoryStore({ reapInterval: 60000 * 10 })
}));

app.get('/', main_controller.homepage);
app.get('/login', main_controller.login);
app.get('/callback', main_controller.callback);

app.listen(1337);
console.log('Listening on port 1337');