const assert = require('assert')
const baseUrl = 'http://localhost:3000/mentions'

describe('Mentions page', function () {
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

        browser.execute(() => {
            Meteor.call('generateTestProblems', 'mentions', (err, data) => {})

            return 'ok'
        })

        browser.pause(3000)

        browser.execute(() => Meteor.call('generateTestMentions'))

        browser.pause(5000)

        browser.url(`${baseUrl}`)

        browser.pause(10000)
    })

    it('renders the page properly', () => {
        assert(browser.isExisting('.mentions-index'), true)
        assert(browser.isVisible('.mentions-index'), true)

        assert(browser.execute(() => ($('.mention-item').length / 2) === testingNotifications.find({
            userId: Meteor.userId(),
            type: 'mention'
        }).count()).value, true)
    })

    it('pub/sub for mentions is working correctly', () => {
        browser.execute(() => Meteor.subscribe('mentions'))
        browser.pause(3000)

        assert(browser.execute(() => {
            let nots = testingNotifications.find({}).fetch()

            return nots.length > 0 && nots.every(i => i.userId === Meteor.userId())
        }).value, true)
    })

    after(() => {
        browser.pause(1000)
        browser.execute(() => Meteor.call('removeTestMentions'))
        browser.pause(3000)

        browser.execute(() => {
            Meteor.call('removeTestProblems', 'mentions', (err, data) => {})

            return 'ok'
        })
    })
})
