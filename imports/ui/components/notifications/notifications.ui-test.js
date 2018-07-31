const assert = require('assert')
const baseUrl = 'http://localhost:3000/notifications' 

describe('Notifications page', function () {
    before(() => {
        browser.url(`http://localhost:3000/`)
        browser.pause(5000)

        browser.execute(() => {
            Meteor.call('generateTestUser', (err, data) => {})

            return 'ok'
        })

        browser.pause(5000)

        browser.execute(() => Meteor.loginWithPassword('testing', 'testing'))

        browser.pause(5000)

        browser.execute(() => Meteor.call('generateTestNotifications'))

        browser.pause(5000)

        browser.url(`${baseUrl}`)

        browser.pause(10000)
    })

    it('renders the page properly', () => {
        assert(browser.isExisting('.notifications-index'), true)
        assert(browser.isVisible('.notifications-index'), true)

        assert(browser.execute(() => ($('.notification-item').length / 2) === testingNotifications.find({
            userId: Meteor.userId(),
            $or: [{
                type: 'notification'
            }, {
                type: {
                    $exists: false
                }
            }]
        }).count()).value, true)
    })

    it('pub/sub for notifications is working correctly', () => {
        browser.execute(() => Meteor.subscribe('notifications'))
        browser.pause(3000)

        assert(browser.execute(() => {
            let nots = testingNotifications.find({}).fetch()

            return nots.length > 0 && nots.every(i => i.userId === Meteor.userId())
        }).value, true)
    })

    after(() => {
        browser.pause(1000)
        browser.execute(() => Meteor.call('removeTestNotifications'))
        browser.pause(3000)
    })
})