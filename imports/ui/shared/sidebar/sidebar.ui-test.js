const assert = require('assert')
const baseUrl = 'http://localhost:3000'

describe('Sidebar', function () {
    before(() => {
        browser.url(`${baseUrl}/`)
        browser.pause(5000)

        browser.execute(() => {
            Meteor.call('generateTestUser', (err, data) => {})

            return 'ok'
        })

        browser.pause(5000)

        browser.execute(() => Meteor.loginWithPassword('testing', 'testing'))

        browser.pause(5000)
    })

    it('should render correctly', function () {
        assert(browser.isExisting('.sidebar'), true)
        assert(browser.isVisible('.sidebar'), true)
    })

    it('should have at least one online user, the tester', () => {
        assert(browser.execute(() => {
            let users = $('.online-item')

            return users.length >= 1 && users.text().includes('Tester')
        }).value, true)
    })
})