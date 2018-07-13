const assert = require('assert')
const baseUrl = 'http://localhost:3000/stats' 

describe('Stats page', function () {
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

        browser.pause(10000)
    })

    it('renders the chart properly', function () {
        assert(browser.isExisting('#js-chart'), true)
        assert(browser.isVisible('#js-chart'), true)
    })

    it('renders the table properly', () => {
        assert(browser.isExisting('.stats-index'), true)
        assert(browser.isVisible('.stats-index'), true)

        assert(browser.execute(() => $('.stats-item').length >= 1).value, true)
    })

    it('pub/sub for stats is working correctly', () => {
        browser.execute(() => Meteor.subscribe('userStats'))
        browser.pause(3000)

        assert(browser.execute(() => {
            let stats = testingStats.find({}).fetch()

            return !!stats
        }).value, true)
    })

    it('data on the chart and in the table is correctly populated', () => {
        assert(browser.execute(() => {
            let users = Meteor.users.find({}).fetch()

            let dataset = Blaze.getView($('#js-chart')[0])._templateInstance.barChart.data.datasets[0].data

            return $('.stats-item').length === dataset.length && dataset.length === users.length
        }).value, true)
    })
})