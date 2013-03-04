var User = require('./User');

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
		        }
		        else
		        {
		        	console.log("New user");
		        	twitter.getFromTwitter();
		        }
	        });

			/*if(client.exists(userIdFromName, redis.print))
			{
				user.id = client.get(userIdFromName, redis.print);
				console.log("User: %o | %o", userIdFromName, user.id);
			}
			else
			{
				console.log("New user");
			}*/

			res.render('result', {title: user.name, user: user});
		}
		else
		{
			res.render('home', {title: 'home'});
		}
	}
}

module.exports = Controller;