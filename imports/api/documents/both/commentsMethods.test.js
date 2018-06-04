import { chai, assert } from 'chai'
import { Meteor } from 'meteor/meteor'
import { Problems } from "./problemCollection.js"
import { Comments } from "./commentsCollection.js"
import { callWithPromise } from '/imports/api/utilities'
import './commentsMethods'


Meteor.userId = () => 'test-user' // override the meteor userId, so we can test methods that require a user
Meteor.users.findOne = () => ({ profile: { name: 'Test User'} }) // stub user data as well
Meteor.user = () => ({ profile: { name: 'Test User'} })

describe('comment methods', () => {
    beforeEach(() => {
        Problems.insert({
            summary: "Derp",
            description: "Lorem ipsum, herp derp durr.",
            solution: "Lorem ipsum, herp derp durr.",
            createdAt: new Date().getTime(),
            createdBy: ''
        })
    })

    it('can delete comment if user is owner', () => {
        let problem = Problems.findOne({})
        assert.ok(problem)

        let commentId = Comments.insert({
            'problemId': problem._id,
            'comment': 'Lorem ipsum something something ...',
            'createdBy': Meteor.userId()
        })

        return callWithPromise('deleteComment', {
            commentId: commentId
        }).then(data => {
            let comment = Comments.find({ createdBy : Meteor.userId() }).fetch()
            assert.equal(comment.length, 0)
        })
    })

    it('cannot delete comment if user is not owner', () => {
        let problem = Problems.findOne({})
        assert.ok(problem)

        let commentId = Comments.insert({
            'problemId': problem._id,
            'comment': 'Lorem ipsum something something ...',
            'createdBy': 'another-user'
        })

        return callWithPromise('deleteComment', {
            commentId: commentId
        }).then(data => {
            // we are expecting an error to occure
        }).catch((err) => {
            assert.include(err.message, 'You are not allowed to delete this comment')
            let comment = Comments.find({ createdBy : 'another-user' }).fetch()
            assert.equal(comment.length, 1)
        })
    })

    it('can edit a comment if user is owner', () => {
        let problem = Problems.findOne({})
        assert.ok(problem)

        let commentId = Comments.insert({
            'problemId': problem._id,
            'comment': 'Lorem ipsum something something ...',
            'createdBy': Meteor.userId()
        })

        return callWithPromise('editComment', {
            commentId: commentId,
            comment: 'Test 123'
        }).then(data => {
            let comment = Comments.findOne({
                _id: commentId
            })

            assert.equal(comment.comment, 'Test 123')
        })
    })

    it('cannot edit a comment if user is not owner', () => {
        let problem = Problems.findOne({})
        assert.ok(problem)

        let commentId = Comments.insert({
            'problemId': problem._id,
            'comment': 'Lorem ipsum something something ...',
            'createdBy': 'another-user'
        })

        return callWithPromise('editComment', {
            commentId: commentId,
            comment: 'Test 123'
        }).then(data => {
            // we are expecting an error to occure
        }).catch((err) => {
            assert.include(err.message, 'You are not allowed to edit this comment')

            let comment = Comments.findOne({
                _id : commentId
            })
            assert.equal(comment.comment, 'Lorem ipsum something something ...')
        })
    })	

    after(function() {
        Problems.remove({})
        Comments.remove({})
    })
})
