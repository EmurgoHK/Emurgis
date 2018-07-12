import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { Notifications } from '/imports/api/notifications/both/notificationsCollection.js'
import { markNotificationAsRead, markAllAsRead } from '/imports/api/notifications/both/notificationsMethods.js'

import './notifications.html'

Template.notifications.onCreated(function() {
    this.unread = new ReactiveVar([])

    this.autorun(() => {
        SubsCache.subscribe('notifications')

        let notifications = Notifications.find({
            userId: Meteor.userId(),
            read: false,
            $or: [{
                type: 'notification'
            }, {
                type: {
                    $exists: false
                }
            }]
        })

        if (notifications.count()) {
            this.unread.set(notifications.map(i => i._id))
        }
    })
})

Template.notifications.events({
    'click .notification-item': function (event, templateInstance) {
        // mark clicked notification as read
        markNotificationAsRead.call({
            notificationId: this._id
        }, (err, data) => {})
        // remove clicked notification from unread notifications list
        let unread = templateInstance.unread.get()
        templateInstance.unread.set(unread.filter(i => i !== this._id))
    },
    'click #markAllAsRead': function (event, templateInstance) {
      markAllAsRead.call({
        userId : Meteor.userId()
      }, (err, data) => {
        if (!err) {
          templateInstance.unread.set([])
        }
      })

    }
})

Template.notifications.helpers({
    notifications: () => Notifications.find({
        userId: Meteor.userId(),
        $or: [{
            type: 'notification'
        }, {
            type: {
                $exists: false
            }
        }]
    }, {
        sort: {
            createdAt: -1
        }
    }),
    read: function() {
        return !~Template.instance().unread.get().indexOf(this._id)
    },
    unreadCount: function() {
        return Template.instance().unread.get().length;
    },
    href: function() {
        return this.href || '#'
    }
})
