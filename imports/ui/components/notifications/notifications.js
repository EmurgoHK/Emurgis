import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { Notifications } from '/imports/api/notifications/both/notificationsCollection.js'
import { markNotificationAsRead } from '/imports/api/notifications/both/notificationsMethods.js'

import './notifications.html'

Template.notifications.onCreated(function() {
    this.unread = new ReactiveVar([])

    this.autorun(() => {
        this.subscribe('notifications')

        let notifications = Notifications.find({
            userId: Meteor.userId(),
            read: false
        })

        if (notifications.count()) { // mark all unread notifications as read
            this.unread.set(notifications.map(i => i._id))

            notifications.fetch().forEach(i => {
                markNotificationAsRead.call({
                    notificationId: i._id
                }, (err, data) => {})
            })
        }
    })
})

Template.notifications.events({
    'click .stats-item': function (event, templateInstance) {
        let unread = templateInstance.unread.get()
        templateInstance.unread.set(unread.filter(i => i !== this._id))
    }
})

Template.notifications.helpers({
    notifications: () => Notifications.find({
        userId: Meteor.userId()
    }, {
        sort: {
            createdAt: -1
        }
    }),
    read: function() {
        return !~Template.instance().unread.get().indexOf(this._id)
    },
    href: function() {
        return this.href || '#'
    } 
})
