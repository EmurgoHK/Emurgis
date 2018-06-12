const assert = require('assert')
const baseUrl = 'http://localhost:3000' // baseUrl of the app we are testing, it's localhost here, as we're starting a local server in Travis CI cycle

const checkStatus = status => {
    return browser.execute((status) => Array.from($('.documents-index-item').map((ind, el) => $(el).find('.badge').html())).some(i => i.toLowerCase() === status), status).value
}

// see the full webdriverio browser API here: http://webdriver.io/api.html
describe('Problems page', function () {
    before(() => {
        browser.url(`${baseUrl}/`)
        browser.pause(5000)

        browser.execute(() => {
            Meteor.call('generateTestProblems', (err, data) => {})

            return 'ok'
        })

        browser.pause(3000)

        browser.execute(() => {
            Meteor.call('generateTestUser', (err, data) => {})

            return 'ok'
        })

        browser.pause(5000)

        browser.execute(() => Meteor.loginWithPassword('testing', 'testing'))

        browser.pause(5000)
    })

    it('It should render the documents-index template', function () {
        assert(browser.isExisting('.documents-index'), true)
        assert(browser.isVisible('.documents-index'), true)
    })

    it('it should have a clickable new problem button', () => {
        assert(browser.isExisting('#new-problem'), true)
    })

    it('all test problems should be shown', () => {
        assert(browser.execute(() => $('.documents-index-item').length).value >= 10, true) // we generate 10 test problems
    })

    it('filtering should work', () => {
        //click on open checkbox to disable it
        let check = ['Open', 'Ready For Review', 'In Progress']

        check.forEach(i => {
            browser.click(`#checkbox${i.replace(/ /ig, '')}`)
            browser.pause(2000)
            assert(!checkStatus(i.toLowerCase()), true) // there should be no open ones then
        })
    })
})