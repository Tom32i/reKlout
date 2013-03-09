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
					res.redirect('/login');
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
				res.redirect("https://api.twitter.com/oauth/authorize?oauth_token=" + oauth_token);
			}
		})
	}

	this.callback = function(req, res)
	{
		console.log(req.query);

		res.render('home', {title: 'home'});
	}
}

module.exports = Controller;