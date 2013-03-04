var querystring = require('querystring'),
	https = require('https'),
	fs = require('fs'),
    TwitterApiCall = require('./TwitterApiCall');

function Twitter (consumer_key, consumer_secret, token, token_secret)
{
	this.consumer_key = consumer_key;
	this.consumer_secret = consumer_secret;
	this.token = token;
	this.token_secret = token_secret;

	this.callback_url = 'http://reklout.loc/callback';
	this.api_url = 'api.twitter.com';
	this.api_version = '1.1';

	this.getFromTwitter = function ()
	{
        var signature = this.signature('users/lookup', {screen_name: 'Tom32i'}, this.token_secret);
        console.log(signature);
        return;
		//return this.call('users/lookup', {screen_name: 'Tom32i'});
	}

	this.call = function (fn, api_params)
    {
        //var multipart  = this.detectMultipart(fn),
        var post_data = this.toUrl(api_params),
            now = new Date(),
            httpmethod = this.detectMethod(fn, api_params),
            path = this.getPath(fn),
            params = {
                oauth_consumer_key: this.consumer_key,
                oauth_nonce: this.nonce(),
                : 'HMAC-SHA1',
                oauth_timestamp: now.oauth_signature_methodgetTime(),
                oauth_token: this.token,
                oauth_version: '1.0'
            };

        var base_string_params = params;

        for(var key in api_params)
        {
            base_string_params[key] = api_params[key];
        }

        var signature_base_string = httpmethod + '&' + encodeURIComponent('https://' + this.api_url + path) + '&' + encodeURIComponent(this.toUrl(base_string_params));   

        params.signature = this.sha1(signature_base_string);

        console.log(signature_base_string);

        var options = {
            hostname: this.api_url,
            path: path + '?' + this.toUrl(api_params),
            method: httpmethod,
            headers: {
                'Authorization': "OAuth " + this.toHeader(params)
            }
        };

        /*
            POST: 
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': post_data.length,

            //req.write(post_data);

         */

		var req = https.request(options, function(res) {
			console.log("statusCode: ", res.statusCode);
			console.log("headers: ", res.headers);

			res.on('data', function(d) {
				process.stdout.write(d);
			});
		});
		req.end();

        console.log(req);

		req.on('error', function(e) {
            console.log(req);
			console.log('problem with request: ' + e.message);
		});
    }

    this.signature = function (fn, api_params, token_secret)
    {
        var httpmethod = this.detectMethod(fn, api_params),
            url = this.getUrl(fn),
            now = new Date(),
            params = {
                oauth_consumer_key: this.consumer_key,
                oauth_nonce: this.nonce(),
                oauth_signature_method: 'HMAC-SHA1',
                oauth_timestamp: now.getTime(),
                oauth_token: this.token,
                oauth_version: '1.0'
            },
            parameter_string = '',
            signature_base_string = '',
            parameters = [];

        for(var key in params)
        {
            parameters[encodeURIComponent(key)] = encodeURIComponent(params[key]);
        }

        for(var key in api_params)
        {
            parameters[encodeURIComponent(key)] = encodeURIComponent(api_params[key]);
        }

        parameters = this.sort(parameters);

        for(var key in parameters)
        {
            if(parameter_string != ""){ parameter_string = parameter_string + '&'; }
            parameter_string = parameter_string + encodeURIComponent(key) + '=' + encodeURIComponent(parameters[key]);
        }

        var signature_base_string = httpmethod + '&' + encodeURIComponent(url) + '&' + encodeURIComponent(parameter_string);
        var signing_key = encodeURIComponent(this.consumer_secret) + '&' + ( typeof(token_secret) != "undefined" ? encodeURIComponent(token_secret) : '');

        return CryptoJS.enc.Base64.stringify(CryptoJS.SHA1(signing_key));
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

    this.toHeader = function (data)
    {
        var str = "";

        for(var key in data)
        {
            if(str != ""){ str = str + ", "; }
            str = str + encodeURIComponent(key) + '="' + data[key] + '"';
        }

        return str;
    }

    this.sha1 = function(data)
    {
        var secret = this.consumer_secret + '&' + this.token_secret;
        var hash = CryptoJS.HmacSHA1(data, secret);
        var str = hash.toString(CryptoJS.enc.Base64);

    	return str;
    }

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
    	var chars = "azertyuiopqsdfghjklmwxcvbnéèçàAZERTYUIOPQSDFGHJKLMWXCVBNÉÈÀÇ",
    		length = 32,
    		phrase = "";

    	for (var i = length - 1; i >= 0; i--)
    	{	
	    	var pos = Math.floor(Math.random() * (chars.length - 1));
	    	phrase = phrase + chars[pos];
    	}

    	return CryptoJS.SHA1(phrase).toString(CryptoJS.enc.Base64);
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