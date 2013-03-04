var querystring = require('querystring'),
	https = require('https'),
	fs = require('fs');

function TwitterApiCall (fn, api_params, token_secret)
{
    this.toUrl = function (data)
    {
        var str = "";

        for(var key in data)
        {
            if(str != ""){ str = str + "&"; }
            str = str + key + '=' + data[key];
        }

        return str;
    }

    this.toHeader = function (data)
    {
        var str = "";

        for(var key in data)
        {
            if(str != ""){ str = str + ", "; }
            str = str + key + '="' + data[key] + '"';
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

    this.httpmethod = this.detectMethod(fn, api_params);
    this.url = this.getUrl(fn);
    tis.now = new Date();
    this.api_params = api_params;
    this.oauth_params = {
        oauth_consumer_key: this.consumer_key,
        oauth_nonce: this.nonce(),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: this.now.getTime(),
        oauth_token: this.token,
        oauth_version: '1.0'
    };

    var parameter_string = '',
        signature_base_string = '',
        parameters = [];

    for(var key in this.oauth_params)
    {
        parameters[encodeURIComponent(key)] = encodeURIComponent(this.oauth_params[key]);
    }

    for(var key in this.api_params)
    {
        parameters[encodeURIComponent(key)] = encodeURIComponent(this.api_params[key]);
    }

    parameters = this.sort(parameters);
    parameter_string = this.toUrl(parameters);

    this.signature_base_string = this.httpmethod + '&' + encodeURIComponent(this.url) + '&' + encodeURIComponent(parameter_string);
    this.signing_key = encodeURIComponent(this.consumer_secret) + '&' + ( typeof(token_secret) != "undefined" ? encodeURIComponent(token_secret) : '');
	this.signature = CryptoJS.enc.Base64.stringify(CryptoJS.SHA1(this.signing_key));
}

module.exports = TwitterApiCall;