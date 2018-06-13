const assert = require('assert')
const baseUrl = 'http://localhost:3000' // baseUrl of the app we are testing, it's localhost here, as we're starting a local server in Travis CI cycle

// see the full webdriverio browser API here: http://webdriver.io/api.html
describe('Problem page', function () {
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

    it('should render properly', () => {
        browser.execute(() => $('.documents-index-item a')[0].click()) // go to the first one

        browser.pause(5000)

        assert(browser.isExisting('.document-show'), true)
        assert(browser.isVisible('.document-show'), true)
    })

    it('commenting should work', () => {
        browser.setValue('#comments', 'lol12121212')

        browser.pause(3000)

        browser.click('.documentCommentBtn')

        browser.pause(3000)

        assert(browser.execute(() => $('#comment-images').length).value >= 1, true)
    })

    it('user can delete his/her comment', () => {
        let c = browser.execute(() => $('#comment-images').length).value

        browser.click('.icon-settings')

        browser.pause(3000)

        browser.click('.delete-comment')
        browser.pause(2000)
        browser.click('.swal-button--confirm')
        browser.pause(3000)

        assert(browser.execute(() => $('#comment-images').length).value === c - 1, true)
    })

    it('user can claim a problem', () => {
        let isClaimed = browser.execute(() => $('.unclaimProblem').length === 1).value

        if (!isClaimed) {
            browser.click('.claimProblem')
            browser.pause(3000)
            browser.click('.swal-button--confirm')
            browser.pause(3000)

            assert(browser.execute(() => $('.unclaimProblem').length === 1).value, true)
        }
    })

    it('user can unclaim a problem', () => {
        let isntClaimed = browser.execute(() => $('.unclaimProblem').length === 1).value

        if (!isntClaimed) {
            browser.click('.claimProblem')
            browser.pause(3000)
            browser.click('.swal-button--confirm')
            browser.pause(3000)

            assert(browser.execute(() => $('.unclaimProblem').length === 1).value, true)
        }
    })

    it('user can solve a problem', () => {
        let isClaimed = browser.execute(() => $('.unclaimProblem').length === 1).value

        if (isClaimed) {
            // todo
        }
    })

    it('user can add dependencies', () => {
        browser.setValue('#dependency', 'derp')
        browser.pause(2000)
        browser.click('.dependency')

        browser.pause(4000)

        assert(browser.execute(() => Array.from($('.card-body h5').map((ind, el) => $(el).text().trim())).some(i => i === 'Dependencies')).value, true)
    })

    it('user can add inverse dependencies', () => {
        browser.setValue('#invDependency', 'derp')
        browser.pause(2000)
        browser.click('.invDependency')

        browser.pause(4000)

        assert(browser.execute(() => $('.card.bg-warning').text().trim().includes('blocking')).value, true)
    })
})