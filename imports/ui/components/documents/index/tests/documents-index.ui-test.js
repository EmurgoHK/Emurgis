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

    it('my rejected problems page shows only rejected problems', () => {
        browser.url(`${baseUrl}/rejected`)
        browser.pause(5000)

        let rejected = browser.execute(() => Array.from($('.documents-index-item').map((ind, el) => $(el).find('.badge').html()))).value

        assert(rejected.every(i => i.toLowerCase() === 'rejected'), true)
        assert(rejected.length === browser.execute(() => testingProblems.find({
            createdBy: Meteor.userId(),
            status: 'rejected'
        }).count()).value, true)
    })

    it('resolved problems page shows only resolved problems', () => {
        browser.url(`${baseUrl}/resolved`)
        browser.pause(5000)

        let rejected = browser.execute(() => Array.from($('.documents-index-item').map((ind, el) => $(el).find('.badge').html()))).value

        assert(rejected.every(i => i.toLowerCase() === 'ready for review'), true)
        assert(rejected.length === browser.execute(() => testingProblems.find({
            createdBy: Meteor.userId(),
            status: 'ready for review'
        }).count()).value, true)
    })

    it('my logged problems shows only problems created by the current user', () => {
        browser.url(`${baseUrl}/logged`)
        browser.pause(5000)

        browser.click('#checkboxClosed')
        browser.pause(2000)

        let count = browser.execute(() => $('.documents-index-item').length).value

        assert(count === browser.execute(() => testingProblems.find({
            createdBy: Meteor.userId()
        }).count()).value, true)
    })

    it('my claimed problems shows only problems that the user has claimed', () => {
        browser.url(`${baseUrl}/claimed`)
        browser.pause(5000)

        browser.click('#checkboxClosed')
        browser.pause(2000)

        let rejected = browser.execute(() => Array.from($('.documents-index-item').map((ind, el) => $(el).find('a').attr('href').replace('/', '')))).value

        rejected.forEach(i => {
            assert(browser.execute((id) => (testingProblems.findOne({
                _id: id
            }) || {}).claimedBy === Meteor.userId(), i).value, true)
        })
    })
})