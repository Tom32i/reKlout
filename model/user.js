function User (name)
{
	this.name = name;
	this.id;

	this.getFromTwitter = function ()
	{
		if(this.name && this.id == null)
		{
			var user = codebird.__call('users/show', {screen_name: this.name});
			console.log(user);
			twitter
		}
	}
}

module.exports = User;