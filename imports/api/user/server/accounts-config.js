import { Meteor } from "meteor/meteor"
import SimpleSchema from "simpl-schema"

const regex = /^[a-zA-Z0-9_.+-]+@(?:(?:[a-zA-Z0-9-]+\.)?[a-zA-Z]+\.)?(emurgo)\.io$/

Accounts.onCreateUser((options, user) => {
	if(!regex.test(user.services.google.email)) {
		throw new Error('Invalid login detaials');
	}

	if (options.profile) {
    	user.profile = options.profile;
  	}

	return user;
})
