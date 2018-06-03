import './header.html'

import { Notifications } from '/imports/api/notifications/both/notificationsCollection'

Template.header.onCreated(function() {
	this.autorun(() => {
		if (Meteor.userId()) {
			this.subscribe('notifications')
		}
	})
})

Template.header.events({
    'click .sign-out': (event) => {
        event.preventDefault()

        if (Meteor.userId()) {
            Meteor.logout()   
        }
    }
})

Template.header.helpers({
	notificationsCount: () => Notifications.find({
    	userId: Meteor.userId(),
    	read: false
    }).count()
})