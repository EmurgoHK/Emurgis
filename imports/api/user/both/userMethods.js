import { Meteor } from 'meteor/meteor'

import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'

export const isModerator = userId => {
	let user = Meteor.users.findOne({
        _id: userId
    })

    return user && user.moderator
}

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