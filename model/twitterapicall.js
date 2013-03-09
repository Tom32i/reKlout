var util = require('util'),
    OAuth = require('oauth').OAuth;

function TwitterApiCall (fn, api_params, token, token_secret)
{	
    this.now = new Date();
    this.fn = fn;
    this.api_params = api_params;
    this.token = typeof(token) != "undefined" ? token : false;
    this.token_secret = typeof(token_secret) != "undefined" ? token_secret : false;

    this.getUrl = function(fn)
    {
        return 'https://' + this.api_url + this.getPath(fn);
    }

    this.getPath = function(fn)
    {
    	if (fn.match(/^oauth/i)) {
            return '/' + fn;
        } else {
        	return '/' + this.api_version + '/'  + fn + '.json';
        }
    }

    this.getParams = function (params)
    {
        var str = "";

        for(key in params)
        {
            if(!fn.match(/^oauth/i))
            {
                str = str + ((str == "") ? '?' : '&') + this.encodeData(key) + this.encodeData(params[key]) ;
            }
        }

        return str;
    }

    this.detectMultipart = function (fn)
    {
    	switch(fn) 
    	{
            case 'statuses/update_with_media':
            case 'account/update_profile_background_image':
            case 'account/update_profile_image':
            case 'account/update_profile_banner':
                return true;

            default: 
            	return false;
        }
    }

    this.detectMethod = function (fn, params)
    {
    	switch(fn) 
    	{
            case 'account/settings':
                return params.length > 0 ? 'POST' : 'GET';

            case 'statuses/destroy/:id':
            case 'statuses/update':
            case 'statuses/retweet/:id':
            case 'statuses/update_with_media':

            // Direct Messages
            case 'direct_messages/destroy':
            case 'direct_messages/new':

            // Friends & Followers
            case 'friendships/create':
            case 'friendships/destroy':
            case 'friendships/update':

            // Users
            case 'account/settings__post':
            case 'account/update_delivery_device':
            case 'account/update_profile':
            case 'account/update_profile_background_image':
            case 'account/update_profile_colors':
            case 'account/update_profile_image':
            case 'blocks/create':
            case 'blocks/destroy':
            case 'account/update_profile_banner':
            case 'account/remove_profile_banner':

            // Favorites
            case 'favorites/destroy':
            case 'favorites/create':

            // Lists
            case 'lists/members/destroy':
            case 'lists/subscribers/create':
            case 'lists/subscribers/destroy':
            case 'lists/members/create_all':
            case 'lists/members/create':
            case 'lists/destroy':
            case 'lists/update':
            case 'lists/create':
            case 'lists/members/destroy_all':

            // Saved Searches
            case 'saved_searches/create':
            case 'saved_searches/destroy/:id':

            // Places & Geo
            case 'geo/place':

            // Spam Reporting
            case 'users/report_spam':

            // OAuth
            case 'oauth/access_token':
            case 'oauth/request_token':
            	return 'POST';

            default:
            	return 'GET';
        }
    }

    this.nonce = function ()
    {
    	var chars = "azertyuiopqsdfghjklmwxcvbnAZERTYUIOPQSDFGHJKLMWXCVBN1234567890",
    		length = 42,
    		phrase = "";

    	for (var i = length - 1; i >= 0; i--)
    	{	
	    	var pos = Math.floor(Math.random() * (chars.length - 1));
	    	phrase = phrase + chars[pos];
    	}

    	return phrase;//CryptoJS.MD5(phrase);
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

    // Collecting the request method and URL:
    this.httpmethod = this.detectMethod(this.fn, this.api_params);
    this.url = this.getUrl(this.fn);

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

    console.log(oa);
}

module.exports = TwitterApiCall;