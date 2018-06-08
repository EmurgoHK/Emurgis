import './header.html'

import { Notifications } from '/imports/api/notifications/both/notificationsCollection'
import { Problems } from '/imports/api/documents/both/problemCollection'

Template.header.onCreated(function() {
	this.autorun(() => {
		if (Meteor.userId()) {
			this.subscribe('notifications')
			this.subscribe('problems')
		}
	})
})

Template.header.events({
    'click .sign-in': function(event) {
        event.preventDefault();
        console.log("called")
    
        Meteor.loginWithGoogle({}, (err) => {
            if (err) { 
                notify("Invalid login", "error")
            return 
            }
            var redirectTo = window.last || '/'
            FlowRouter.go(redirectTo)
        })
    },
    'click .sign-out': (event) => {
        event.preventDefault()

        if (Meteor.userId()) {
            Meteor.logout()   
        }
    },
    'click .sidebar-toggler': function() {
        // toggle "sidebar-show" class to show/hide sidebar
        $('body').toggleClass("sidebar-lg-show")
    }
})

Template.header.helpers({
	notificationsCount: () => Notifications.find({
    	userId: Meteor.userId(),
    	read: false
    }).count(),
    resolvedProblemsCount: () => Problems.find({
        createdBy: Meteor.userId(),
        status: 'ready for review'
    }).count()
})