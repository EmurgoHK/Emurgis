import { chai, assert } from 'chai'
import { Meteor } from 'meteor/meteor'
import { Problems } from "./problemCollection.js"
import { callWithPromise } from '/imports/api/utilities'
import './problemMethods.js'


Meteor.userId = () => 'test-user' // override the meteor userId, so we can test methods that require a user
Meteor.users.findOne = () => ({ profile: { name: 'Test User'} }) // stub user data as well
Meteor.user = () => ({ profile: { name: 'Test User'} })

describe('problem methods', () => { 
    beforeEach(() => {
        Problems.insert({
            summary: "Derp",
            description: "Lorem ipsum, herp derp durr.",
            solution: "Lorem ipsum, herp derp durr.",
            createdAt: new Date().getTime(),
            createdBy: ''
        })
    })

    it('can add new problem with a default status of open', () => {
        let data = {}

        data.summary = 'Test summary'
        data.description = 'an awesome test description...'
        data.solution = 'a very valid test solution for problem...'

        return callWithPromise('addProblem', data)
            .then(problemId => {
                let problem = Problems.findOne({ _id : problemId})

                assert.equal(Problems.find({}).count(), 2)
                assert.equal(problem.status, 'open')
            })
    })

    it('can claim problem and assign status of \'in progress\'', () => {
        let problem = Problems.findOne({})
        assert.ok(problem)
        
        return callWithPromise('claimProblem', { _id : problem._id })
            .then(problemId => {
                let problem = Problems.findOne({ _id : problemId })

                assert.equal(problem.claimedBy, Meteor.userId())
                assert.equal(problem.status, 'in progress')
            })
    })

    it('can unclaim problem and re-assign status of \'open\'', () => {
        let problem = Problems.findOne({ 'claimedBy' : Meteor.userId() })
        assert.ok(problem)
        
        return callWithPromise('unclaimProblem', { _id : problem._id })
            .then(problemId => {
                let problem = Problems.findOne({ _id : problemId })

                assert.isUndefined(problem.claimedBy)
                assert.equal(problem.status, 'open')
            })
    })

    it('can mark problem as resolved if current user is claimer', () => {
        let problem = Problems.findOne({})
        assert.ok(problem)

        Problems.update({ _id : problem._id }, {
            $set : { claimedBy : Meteor.userId() }
        })

        return callWithPromise('markAsResolved', { 
            problemId: problem._id, 
            claimerId: Meteor.userId()
        }).then(problemId => {
            let problem = Problems.findOne({ _id : problemId})
            assert.equal(problem.status, 'ready for review')
        })

    })

	it('cannot mark problem as resolved if current user isnt claimer', () => {
        let problem = Problems.findOne({})
        assert.ok(problem)

        Problems.update({ _id : problem._id }, {
            $set : { claimedBy : 'fake-claimer' }
        })

        return callWithPromise('markAsResolved', { 
            problemId: problem._id, 
            claimerId: 'fake-claimer'
        }).then(data => {
            assert.isNull(data)
        }).catch(err => {
            assert.include(err.message, 'You are not allowed to resolve this problem')
        })

    })

    after(function() {
        Problems.remove({})
    })
})
