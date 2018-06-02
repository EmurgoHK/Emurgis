Meteor.publish('users', () => Meteor.users.find({}, {
	fields: {
		'profile.name': 1,
		_id: 1
	}
}))

Meteor.publish('user', userId => Meteor.users.find({
	_id: userId
}, {
	fields: {
		'profile.name': 1,
		_id: 1
	}
}))