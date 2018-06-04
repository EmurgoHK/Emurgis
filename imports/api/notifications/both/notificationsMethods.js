import { Meteor } from 'meteor/meteor'

import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'

import { Notifications } from './notificationsCollection.js'

export const sendNotification = (userId, message, from, href) => {
    Notifications.insert({
        userId: userId,
        from: from || 'System',
        href: href || '',
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
