const assert = require('assert')
const baseUrl = 'http://localhost:3000/new'

const path = require('path')

describe('New problem page', function () {
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

    it('should render correctly', () => {
        assert(browser.isExisting('#fileUploadValue'), true)
        assert(browser.isVisible('#fileUploadValue'), true)
    })

    it('should upload an image correctly', () => {
        const file = path.join(__dirname, '..', '..', '..', '..', 'public', 'img', 'dog.jpg')

        browser.chooseFile('#imageInput', file)
        browser.pause(10000)

        assert(browser.execute(() => $('#fileUploadValue').text() === 'Upload another image').value, true)
        assert(browser.execute(() => Array.from($('#preview img').map((i, el) => $(el).attr('src'))).length > 0).value, true)
    })
})