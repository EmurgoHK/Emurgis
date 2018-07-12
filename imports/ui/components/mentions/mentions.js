import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { Notifications } from '/imports/api/notifications/both/notificationsCollection'
import { Problems } from '/imports/api/documents/both/problemCollection'
import { markNotificationAsRead, markAllAsRead } from '/imports/api/notifications/both/notificationsMethods'

import './mentions.html'

Template.mentions.onCreated(function() {
    this.unread = new ReactiveVar([])

    this.autorun(() => {
        SubsCache.subscribe('mentions')
        SubsCache.subscribe('problems')

        let mentions = Notifications.find({
            userId: Meteor.userId(),
            read: false,
            type: 'mention'
        })

        if (mentions.count()) {
            this.unread.set(mentions.map(i => i._id))
        }
    })
})

Template.mentions.events({
    'click .mention-item': function (event, templateInstance) {
        markNotificationAsRead.call({
            notificationId: this._id
        }, (err, data) => {})

        templateInstance.unread.set(templateInstance.unread.get().filter(i => i !== this._id))
    },
    'click #markAllAsRead': function (event, templateInstance) {
        markAllAsRead.call({
            userId: Meteor.userId(),
            type: 'mention'
        }, (err, data) => {
            if (!err) {
                templateInstance.unread.set([])
            }
        })
    }
})

Template.mentions.helpers({
    problems: () => {
        let notifications = Notifications.find({
            userId: Meteor.userId(),
            type: 'mention'
        }, {
            sort: {
                createdAt: -1
            }
        }).fetch()

        return Problems.find({
            _id: {
                $in: _.uniq(notifications.map(i => i.href.substr(1)))
            }
        })
    },
    mentions: function() {
        let notifications = Notifications.find({
            userId: Meteor.userId(),
            type: 'mention'
        }).fetch()

        return notifications.filter(j => j.href === `/${this._id}`).sort((j1, j2) => j2.createdAt - j1.createdAt)
    },
    read: function() {
        return !~Template.instance().unread.get().indexOf(this._id)
    },
    unreadCount: () => Template.instance().unread.get().length,
    href: function() {
        return this.href || '#'
    }
})
