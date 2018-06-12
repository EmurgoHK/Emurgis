const assert = require('assert')
const baseUrl = 'http://localhost:3000' // baseUrl of the app we are testing, it's localhost here, as we're starting a local server in Travis CI cycle

// see the full webdriverio browser API here: http://webdriver.io/api.html
describe('Problems page', function () {
    beforeEach(() => {
        browser.url(`${baseUrl}/`) // navigate to the home route `/`
        browser.pause(5000) // let it load, wait for 2 seconds
    })

    it('It should render the documents-index template', function () {
        assert(browser.isExisting('.documents-index'), true)
        assert(browser.isVisible('.documents-index'), true)
    })

    it('it should have a clickable new problem button', () => {
        assert(browser.isExisting('#new-problem'), true)
        browser.click('#new-problem')
    })
})