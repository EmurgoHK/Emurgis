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

    it ('should show modals and create a new problem when submitted', function() {
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

        assert(browser.execute(() => {
            let problem = testingProblems.findOne({
                _id: FlowRouter.current().params.documentId
            }) || {}

            return problem.summary === 'T' && problem.description === 'T' && problem.solution === 'T'
        }).value, true)
    })

    it ('user can edit the created problem', function() {
        browser.url(`http://localhost:3000/${browser.execute(() => FlowRouter.current().params.documentId).value}/edit`)
        browser.pause(5000)

        assert(browser.getValue('#description') === 'T', true)
        assert(browser.getValue('#summary') === 'T', true)
        assert(browser.getValue('#solution') === 'T', true)

        browser.setValue('#summary', '')
        browser.pause(2000)
        browser.setValue('#summary', 'Andrej')
        browser.pause(2000)

        browser.click('.newproblem')
        browser.pause(3000)

        assert(browser.execute(() => FlowRouter.current().route.name).value === 'documentShow', true)
        assert(browser.execute(() => !!FlowRouter.current().params.documentId).value, true)

        assert(browser.execute(() => {
            let problem = testingProblems.findOne({
                _id: FlowRouter.current().params.documentId
            }) || {}

            return problem.summary === 'Andrej' && problem.description === 'T' && problem.solution === 'T'
        }).value, true)
    })

    it ('user can delete the problem he has added', () => {
        let id = browser.execute(() => FlowRouter.current().params.documentId).value

        browser.click('.js-delete-document')
        browser.pause(2000)

        browser.click('.swal-button--confirm')
        browser.pause(3000)

        assert(browser.execute((id) => {
            let problem = testingProblems.findOne({
                _id: id
            })

            return !problem
        }, id), true)
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