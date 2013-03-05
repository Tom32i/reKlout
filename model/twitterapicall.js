var querystring = require('querystring'),
	https = require('https'),
	fs = require('fs');

function TwitterApiCall (fn, api_params, token, token_secret)
{	
    this.now = new Date();
    this.fn = fn;
    this.api_params = api_params;
    this.token = typeof(token) != "undefined" ? token : false;
    this.token_secret = typeof(token_secret) != "undefined" ? token_secret : false;

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
            str = str + encodeURIComponent(key) + '="' + encodeURIComponent(data[key]) + '"';
        }

        return str;
    }

    this.sha1 = function(data)
    {
        var secret = this.consumer_secret + '&' + ( this.token_secret ? this.token_secret : '');
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

    this.getParams = function (params)
    {
        var str = "";

        for(key in params)
        {
            if(!fn.match(/^oauth/i))
            {
                str = str + ((str == "") ? '?' : '&') + encodeURIComponent(key) + encodeURIComponent(params[key]) ;
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

    // Collecting parameters:
    this.oauth_params = {
        oauth_consumer_key: this.consumer_key,
        oauth_nonce: this.nonce(),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: this.now.getTime(),
        oauth_version: this.oauth_version
    };

    if(this.token)
    {
        this.oauth_params.oauth_token = this.token;
    }

    this.oauth_params = this.sort(this.oauth_params);

    // Generating Parameter String:
    var parameters = [];

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
    //console.log('Parameter String:');
    //console.log(parameter_string);
    //console.log(' ');

    /* 
        Make sure to percent encode the parameter string! 
        The signature base string should contain exactly 2 ampersand '&' characters. 
        The percent '%' characters in the parameter string should be encoded as %25 in the signature base string. 
    */
    //console.log('Encoded Parameter String:');
    //console.log(encodeURIComponent(parameter_string));
    //console.log(' ');

    // Creating the signature base string:
    this.signature_base_string = this.httpmethod + '&' + encodeURIComponent(this.url) + '&' + encodeURIComponent(parameter_string);

    //console.log('signature_base_string:');
    //console.log(this.signature_base_string);
    //console.log(' ');

    // Creating the signing key :
    this.signing_key = encodeURIComponent(this.consumer_secret) + '&' + ( this.token_secret ? encodeURIComponent(token_secret) : '');

    //console.log('signing_key:');
    //console.log(this.signing_key);
    //console.log(' ');

    // Generating the signature:
	this.signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1(this.signature_base_string, this.signing_key));

    //console.log('signature:');
    //console.log(this.signature);
    //console.log(' ');

    //this.path = this.getPath(this.fn) + this.getParams(this.toUrl(this.api_params));

	//this.oauth_params.signature = this.signature;

	this.oauth_params = this.sort(this.oauth_params);

	//this.header = 'OAuth ' + this.toHeader(this.oauth_params);
}

module.exports = TwitterApiCall;