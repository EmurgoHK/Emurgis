const assert = require('assert')
const baseUrl = 'http://localhost:3000/new'

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

        browser.pause(5000)
    })

    it('It should render the documents-new template', function () {
        let elems = ['summary', 'description', 'solution', 'dependency', 'invDependency']

        elems.forEach(i => {
            assert(browser.isExisting(`#${i}`), true)
            assert(browser.isVisible(`#${i}`), true)
        })
    })

    it ('should create a new problem when submitted', function() {
        browser.setValue('#summary', 'T')
        browser.pause(2000)
        browser.click('.swal-button--ok')
        browser.pause(3000)
        browser.setValue('#description', 'T')
        browser.pause(2000)
        browser.click('.swal-button--ok')
        browser.pause(3000)
        browser.setValue('#solution', 'T')
        browser.pause(2000)
        browser.click('.swal-button--ok')
        browser.pause(3000)

        browser.click('.newproblem')

        browser.pause(4000)

        assert(browser.execute(() => FlowRouter.current().route.name).value === 'documentShow', true)
        assert(browser.execute(() => !!FlowRouter.current().params.documentId).value, true)
    })

    it ('dependencies can be added on the form', function() {
        browser.url(`${baseUrl}`)

        browser.pause(5000)

        browser.setValue('#dependency', 'T')
        browser.pause(2000)
        browser.click('.dependency')

        browser.pause(4000)

        assert(browser.execute(() => $('.remove-dep').length).value === 1, true)
    })

    it ('dependencies can be removed on the form', function() {
        browser.click('.remove-dep')

        browser.pause(4000)

        assert(browser.execute(() => $('.remove-dep').length).value === 0, true)
    })

    it ('inverse dependencies can be added on the form', function() {
        browser.setValue('#invDependency', 'T')
        browser.pause(2000)
        browser.click('.invDependency')

        browser.pause(4000)

        assert(browser.execute(() => $('.remove-dep-inv').length).value === 1, true)
    })

    it ('inverse dependencies can be removed on the form', function() {
        browser.click('.remove-dep-inv')

        browser.pause(4000)

        assert(browser.execute(() => $('.remove-dep-inv').length).value === 0, true)
    })

    it ('won\'t work if you\'re not logged in', function() {
        browser.execute(() => Meteor.logout())

        browser.pause(4000)

        assert(browser.execute(() => FlowRouter.current().route.name).value === 'documentsIndex', true)
    })
})