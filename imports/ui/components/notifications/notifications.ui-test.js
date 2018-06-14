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

        browser.url(`${baseUrl}`)

        browser.pause(5000)
    })

    it('renders the page properly', () => {
        assert(browser.isExisting('.notifications-index'), true)
        assert(browser.isVisible('.notifications-index'), true)

        assert(browser.execute(() => $('.notification-item').length === testingNotifications.find({
            userId: Meteor.userId()
        }).count()).value, true)
    })
})