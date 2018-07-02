import { Meteor } from 'meteor/meteor'

import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'

export const isModerator = userId => {
	let user = Meteor.users.findOne({
        _id: userId
    })

    return user && user.moderator
}

export const provideDob = new ValidatedMethod({
    name: 'provideDob',
    validate: new SimpleSchema({
        dob: {
            type: Date,
            optional: false
        }
    }).validator({
        clean: true
    }),
    run({ dob }) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }

        return Meteor.users.update({
            _id: Meteor.userId()
        }, {
            $set: {
                'profile.dob': new Date(dob).getTime()
            }
        })
    }
})

export const hideHelpModal = new ValidatedMethod({
    name: 'hideHelpModal',
    validate: new SimpleSchema({
    	helpModalId: {
    		type: String,
    		optional: false
    	}
    }).validator({
    	clean: true
    }),
    run({ helpModalId }) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }

        return Meteor.users.update({
        	_id: Meteor.userId()
        }, {
        	$addToSet: {
        		hidden: helpModalId
        	}
        })
    }
})

export const resetHiddenModals = new ValidatedMethod({
    name: 'resetHiddenModals',
    validate: new SimpleSchema({
    	userId: {
    		type: String,
    		optional: false
    	}
    }).validator({
    	clean: true
    }),
    run({ userId }) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }

        let curUser = Meteor.users.findOne({
        	_id: Meteor.userId()
        })

        if (!curUser || !curUser.moderator) {
        	throw new Meteor.Error('Error.', 'You have to be a moderator in order to do this.')
        }

        return Meteor.users.update({
        	_id: userId
        }, {
        	$set: {
        		hidden: []
        	}
        })
    }
})

export const addTag = new ValidatedMethod({
		name: 'addTag',
		validate: new SimpleSchema({
			userId: { type: String, optional: false },
			tag: { type: String, optional: false }
		}).validator({
			clean: true
		}),
		run({ userId, tag }) {
				if (!Meteor.userId()) {
						throw new Meteor.Error('Error.', 'You have to be logged in.')
				}

				return Meteor.users.update({
						_id: userId
				}, {
						$addToSet: {
								'profile.tags': tag // Save the new tag in the list of tags
						}
				})
		}
})

export const removeTag = new ValidatedMethod({
	name: 'removeTag',
	validate: new SimpleSchema({
		userId: { type: String, optional: false },
		tag: { type: String, optional: false }
	}).validator({
		clean: true
	}),
	run({ userId, tag }) {
			if (!Meteor.userId()) {
					throw new Meteor.Error('Error.', 'You have to be logged in.')
			}

			return Meteor.users.update({
					_id: userId
			}, {
					$pull: {
							'profile.tags': tag // remove the tag in the list of tags
					}
			})

	}
})

export const defaultTagAddedFlag = new ValidatedMethod({
    name: 'defaultTagAddedFlag',
    validate: new SimpleSchema({
        defaultTagAdded: {
            type: Boolean,
            optional: false
        }
    }).validator({
        clean: true
    }),
    run({ defaultTagAdded }) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }

        return Meteor.users.update({
            _id: Meteor.userId()
        }, {
            $set: {
                'profile.defaultTagAdded': defaultTagAdded
            }
        })
    }
})

if (Meteor.isDevelopment) {
    Meteor.methods({
        generateTestUser: () => {
            Accounts.createUser({
                username: 'testing',
                password: 'testing',
                email: 'testing@testing.test',
                profile: {
                	name: 'Tester',
                	dob: 787536000000.0
                }
            })
        }
    })
}
