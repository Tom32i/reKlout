var querystring = require('querystring'),
	https = require('https'),
	fs = require('fs'),
    TwitterApiCall = require('./TwitterApiCall');

function Twitter (consumer_key, consumer_secret, callback_url, token, token_secret)
{
    this.consumer_key = consumer_key;
    this.consumer_secret = consumer_secret;
    this.token = token;
    this.token_secret = token_secret;
	this.callback_url = callback_url;
    this.api_url = 'api.twitter.com';
    this.api_version = '1.1';
    this.oauth_version = '1.0';

    TwitterApiCall.prototype.consumer_key = this.consumer_key;
    TwitterApiCall.prototype.consumer_secret = this.consumer_secret;
    TwitterApiCall.prototype.callback_url = this.callback_url;
    TwitterApiCall.prototype.api_url = this.api_url;
    TwitterApiCall.prototype.api_version = this.api_version;
    TwitterApiCall.prototype.oauth_version = this.oauth_version;

	this.getFromTwitter = function ()
	{
        return this.call('users/lookup', {screen_name: 'Tom32i'});
	}

	this.call = function (fn, api_params)
    {
        //var api_call = new TwitterApiCall('users/lookup', {screen_name: 'Tom32i'}, this.token_secret);
        //var api_call = new TwitterApiCall('oauth/request_token', {oauth_callback: this.callback_url}, this.token);

        var oa = new OAuth(
            "https://api.twitter.com/oauth/request_token",
            "https://api.twitter.com/oauth/access_token",
            this.consumer_key,
            this.consumer_secret,
            this.oauth_version,
            this.callback_url,
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
            res.redirect("https://www.google.com/accounts/OAuthAuthorizeToken?oauth_token="+oauth_token);
          }
        })

        /*
            POST: 
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': post_data.length,

            //req.write(post_data);

         */

		/*var req = https.request(options, function(res) {
			console.log("statusCode: ", res.statusCode);
			console.log("headers: ", res.headers);

			res.on('data', function(d) {
				process.stdout.write(d);
			});
		});
		req.end();

		req.on('error', function(e) {
            console.log(req);
			console.log('problem with request: ' + e.message);
		});*/
    }

    this.post = function(options, data)
    {
        if(data)
        {
            var post_data = this.toUrl(data);
            options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            options.headers['Content-Length'] = post_data.length;
        }

        options.method = 'POST';

        options.headers = this.sort(options.headers);
        options = this.sort(options);

        console.log('The options:');
        console.log(options);
        console.log(' ');

        var req = https.request(options, function(res) {
            console.log("statusCode: ", res.statusCode);
            console.log("headers: ", res.headers);

            res.on('data', function(d) {
                process.stdout.write(d);
            });
        });

        if(data)
        {
            req.write(post_data);
        }

        req.end();

        console.log('The headers:');
        console.log(req);
        console.log(' ');

        req.on('error', function(e) {
            console.log('problem with request: ' + e.message);
        });
    }

    this.get = function()
    {

    }

    this.toUrl = function (data)
    {
        var str = "";

        for(var key in data)
        {
            if(str != ""){ str = str + "&"; }
            str = str + encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
        }

        return str;
    }

    this.sort = function (obj)
    {
        var sorted = {},
            keys = [],
            k, i, len;

        for (k in obj)
        {
            if (obj.hasOwnProperty(k))
            {
                keys.push(k);
            }
        }

        keys.sort();

        len = keys.length;

        for (i = 0; i < len; i++)
        {
            k = keys[i];
            sorted[k] = obj[k];
        }

        return sorted;
    }
}

module.exports = Twitter;