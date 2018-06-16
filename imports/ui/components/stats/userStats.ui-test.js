const assert = require('assert')
const baseUrl = 'http://localhost:3000/stats' 

describe('Stats page', function () {
    before(() => {
        browser.url(`http://localhost:3000/`)
        browser.pause(10000)

        browser.execute(() => {
            Meteor.call('generateTestUser', (err, data) => {})

            return 'ok'
        })

        browser.pause(5000)

        browser.execute(() => Meteor.loginWithPassword('testing', 'testing'))

        browser.pause(5000)

        browser.url(`${baseUrl}`)

        browser.pause(10000)
    })

    it('renders the chart properly', function () {
        assert(browser.isExisting('#js-chart'), true)
        assert(browser.isVisible('#js-chart'), true)
    })

    it('renders the table properly', () => {
        assert(browser.isExisting('.table'), true)
        assert(browser.isVisible('.table'), true)

        assert(browser.execute(() => $('.stats-item').length >= 1).value, true)
    })
})