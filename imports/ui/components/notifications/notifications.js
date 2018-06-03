import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { Notifications } from '/imports/api/notifications/both/notificationsCollection.js'
import { markNotificationAsRead } from '/imports/api/notifications/both/notificationsMethods.js'

import './notifications.html'

Template.notifications.onCreated(function() {
    this.autorun(() => {
        this.subscribe('notifications')

        let notifications = Notifications.find({
            userId: Meteor.userId(),
            read: false
        })

        if (notifications.count()) { // mark all unread notifications as read
            notifications.fetch().forEach(i => {
                markNotificationAsRead.call({
                    notificationId: i._id
                }, (err, data) => {})
            })
        }
    })
})

Template.notifications.helpers({
    notifications: () => Notifications.find({
        userId: Meteor.userId()
    }, {
        sort: {
            createdAt: -1
        }
    }),
    href: function() {
        return this.href || '#'
    } 
})
