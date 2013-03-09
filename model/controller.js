var User = require('./user'),
    OAuth = require('oauth').OAuth;

function Controller ()
{
	this.homepage = function(req, res)
	{
		var user = new User(req.query.name);

		if(user.name)
		{
			var userIdFromName = "username:" + user.name + ":id";

			client.get(userIdFromName, function (err, reply) 
			{
				if(reply)
				{
					user.id = reply;
					res.render('result', {title: user.name, user: user});
				}
				else
				{		        	
					res.redirect(config.base_url + '/login');
				}
			});
		}
		else
		{
			res.render('home', {title: 'home'});
		}
	}

	this.login = function(req, res)
	{
		var oa = new OAuth(
			"https://api.twitter.com/oauth/request_token",
			"https://api.twitter.com/oauth/access_token",
			config.twitter.consumer_key,
			config.twitter.consumer_secret,
			config.twitter.oauth_version,
			config.twitter.callback_url,
			"HMAC-SHA1"
		);

		oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
			if(error) {
				console.log('error');
				console.log(error);
			}
			else { 
				// store the tokens in the session
				req.session.oa = oa;
				req.session.oauth_token = oauth_token;
				req.session.oauth_token_secret = oauth_token_secret;

				// redirect the user to authorize the token
				res.redirect("https://api.twitter.com/oauth/authenticate?oauth_token=" + oauth_token);
			}
		});
	}

	this.callback = function(req, res)
	{
		var oa = new OAuth(
			req.session.oa._requestUrl,
			req.session.oa._accessUrl,
			req.session.oa._consumerKey,
			req.session.oa._consumerSecret,
			req.session.oa._version,
			req.session.oa._authorize_callback,
			req.session.oa._signatureMethod
		);

		//req.session.oauth_token = req.query.oauth_token;
		//req.session.oauth_verifier = req.query.oauth_verifier;

		oa.getOAuthAccessToken(
			req.session.oauth_token, 
			req.session.oauth_token_secret, 
			req.query.oauth_verifier, 
			function(error, oauth_access_token, oauth_access_token_secret, results2) {

				if(error) {
					console.log('error');
					console.log(error);
		 		}
		 		else {

					// store the access token in the session
					req.session.oauth_access_token = oauth_access_token;
					req.session.oauth_access_token_secret = oauth_access_token_secret;
		 		}

		});

		res.render('home', {title: 'home'});
	}
}

module.exports = Controller;