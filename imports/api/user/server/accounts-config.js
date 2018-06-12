import { Meteor } from "meteor/meteor"
import SimpleSchema from "simpl-schema"

const regex = /^[a-zA-Z0-9_.+-]+@(?:(?:[a-zA-Z0-9-]+\.)?[a-zA-Z]+\.)?(emurgo)\.io$/

Accounts.onCreateUser((options, user) => {
	var currentEnv = process.env.NODE_ENV
	
	if(!regex.test((user.services.google || {}).email) && currentEnv !== 'development') {
		throw new Error('Invalid login details')
	}

	if (options.profile) {
    	user.profile = options.profile;
  	}

	return user;
})
