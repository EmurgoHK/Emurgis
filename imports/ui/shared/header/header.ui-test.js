const assert = require('assert')
const baseUrl = 'http://localhost:3000' // baseUrl of the app we are testing, it's localhost here, as we're starting a local server in Travis CI cycle

// see the full webdriverio browser API here: http://webdriver.io/api.html
describe('page header', function () {
    before(() => {
        browser.url(`${baseUrl}/`) // navigate to the home route `/`
        browser.pause(5000) // let it load, wait for 2 seconds

        browser.execute(() => {
            Meteor.call('generateTestProblems', (err, data) => {})

            return 'ok'
        })

        browser.pause(5000)
    })

    it('should have sign in link', function () {
        assert(browser.isExisting('.sign-in'), true)
        assert(browser.isVisible('.sign-in'), true)
    })

    it('should have a github link', () => {
        assert(browser.isExisting('.github'), true)
    })

    it('should have a searchbar', () => {
        assert(browser.isExisting('#searchFilterHeader'), true)
        assert(browser.isVisible('#searchFilterHeader'), true)
    })

    it('should hide sidebar when nav-bar toggler is clicked', () => {
        browser.click('.navbar-toggler')
        assert(browser.isExisting('.sidebar'), false)
        assert(browser.isVisible('.sidebar'), false)
    })

    it('search bar should work', () => {
        browser.setValue('#searchFilterHeader', 'derp')

        browser.pause(3000)

        assert(browser.execute(() => FlowRouter.current().route.name).value === 'documentsIndex', true)

        assert(browser.execute(() => Array.from($('.documents-index-item').map((ind, el) => $(el).find('a').html())).some(i => /derp/ig.test(i))).value, true)
    })
})