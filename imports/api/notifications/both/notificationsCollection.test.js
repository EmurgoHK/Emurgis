import { chai, assert } from 'chai'
import { Meteor } from 'meteor/meteor'
import { Notifications } from './notificationsCollection.js'

import { callWithPromise } from '/imports/api/utilities'

import './notificationsMethods.js'

import { sendNotification } from './notificationsMethods'


Meteor.userId = () => 'test-user' // override the meteor userId, so we can test methods that require a user
Meteor.users.findOne = () => ({ profile: { name: 'Test User'} }) // stub user data as well
Meteor.user = () => ({ profile: { name: 'Test User'} })

describe('notifications methods', () => {
    it('can send a notification', () => {
      sendNotification(Meteor.userId(), 'test message', 'System', '#')

      let notification = Notifications.findOne({
        userId: Meteor.userId(),
        message: 'test message'
      })

      assert.ok(notification)

      assert.equal(notification.userId, Meteor.userId())
      assert.equal(notification.message, 'test message')
      assert.equal(notification.href, '#')
    })

    it('can mark a notification as read', () => {
        let notification = Notifications.findOne({
          read: false
        })

        assert.ok(notification)

        return callWithPromise('markNotificationAsRead', {
            notificationId: notification._id
        }).then(notificationId => {
            let n = Notifications.findOne({
              _id : notification._id
            })

            assert.equal(n.read, true)
        })

    })

    it('can mark all notifications as read', () => {
        sendNotification(Meteor.userId(), 'test message2', 'System', '#')
        let notification = Notifications.update({}, {
          $set : {
            read: false
          }
        }, { multi: true })

        assert.ok(notification)

        return callWithPromise('markAllAsRead', {
            userId: Meteor.userId()
        }).then(data => {
            assert.equal(data, 2)
        })

    })

    after(function() {
        Notifications.remove({})
    })
})
