Meteor.publish('users', () => Meteor.users.find({}, {
	fields: {
		'profile.name': 1,
        'profile.tags': 1,
        'profile.defaultTagAdded': 1,
		_id: 1
	}
}))

Meteor.publish('user', userId => Meteor.users.find({
	_id: userId
}, {
	fields: {
		'profile.name': 1,
		_id: 1,
		moderator: 1
	}
}))

Meteor.publish(null, () => Meteor.users.find({
	_id: Meteor.userId()
}, {
	fields: {
		'profile.name': 1,
		_id: 1,
		moderator: 1,
		hidden: 1
	}
}))
