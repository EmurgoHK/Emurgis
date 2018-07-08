import { Meteor } from 'meteor/meteor'

import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'

import { Notifications } from './notificationsCollection.js'
import { Problems } from '/imports/api/documents/both/problemCollection'

export const sendNotification = (userId, message, from, href, type) => {
    Notifications.insert({
        userId: userId,
        from: from || 'System',
        href: href || '',
        type: type || 'notification',
        message: message,
        createdAt: new Date().getTime(),
        read: false
    })
}

export const markNotificationAsRead = new ValidatedMethod({
    name: 'markNotificationAsRead',
    validate: new SimpleSchema({
    	notificationId: {
    		type: String,
    		optional: false
    	}
    }).validator({
    	clean: true
    }),
    run({ notificationId }) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }

        return Notifications.update({
        	_id: notificationId
        }, {
        	$set: {
        		read: true,
        		readAt: new Date().getTime()
        	}
        })
    }
})

export const markAllAsRead = new ValidatedMethod({
    name: 'markAllAsRead',
    validate: new SimpleSchema({
    	userId: {
    		type: String,
    		optional: false
    	},
    	type: {
    		type: String,
    		optional: true
    	}
    }).validator({
    	clean: true
    }),
    run({ userId, type }) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }

        return Notifications.update({
        	userId: userId,
          	read: false,
          	$or: [{
          		type: type || 'notification'
          	}, {
          		type: {
          			$exists: false
          		}
          	}]
        }, {
        	$set: {
        		read: true,
        		readAt: new Date().getTime()
        	}
        }, {
          multi: true
        })
    }
})

if (Meteor.isDevelopment) {
    Meteor.methods({
        generateTestNotifications: () => {
            for (let i = 0; i < 10; i++) {
                Notifications.insert({
			        userId: Meteor.userId(),
			        from: 'System',
			        href: '',
			        message: 'Test notification',
			        createdAt: new Date().getTime(),
			        read: false,
			        type: 'notification'
			    })
            }
        },
        removeTestNotifications: () => {
            Notifications.remove({
                message: 'Test notification'
            })
        },
        generateTestMentions: () => {
            for (let i = 0; i < 10; i++) {
                Notifications.insert({
			        userId: Meteor.userId(),
			        from: 'System',
			        href: `/${(Problems.findOne({
			        	testContext: 'mentions'
			        }) || {})._id}`,
			        message: 'Test mention for you',
			        createdAt: new Date().getTime(),
			        read: false,
			        type: 'mention'
			    })
            }
        },
        removeTestNotifications: () => {
            Notifications.remove({
                message: 'Test mention for you'
            })
        }
    })
}
