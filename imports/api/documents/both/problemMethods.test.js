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

    it('can mark problem as resolved if current user is claimer', () => {
        let problem = Problems.findOne({})
        assert.ok(problem)

        Problems.update({ _id : problem._id }, {
            $set : { claimedBy : Meteor.userId() }
        })

        return callWithPromise('markAsResolved', {
            problemId: problem._id,
            claimerId: Meteor.userId(),
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

    it('cannot close the problem if current user isnt creator', () => {
          let problem = Problems.findOne({})
          assert.ok(problem)

          return callWithPromise('updateStatus', {
              problemId: problem._id,
              status: 'closed'
          }).then(data => {
              assert.isNull(data)
          }).catch(err => {
              assert.include(err.message, 'You are not allowed to open or close this problem')
          })

      })

    it('can close the problem if current user is creator', () => {
          let problem = Problems.findOne({})
          assert.ok(problem)

          Problems.update({ _id : problem._id }, {
              $set : { createdBy : Meteor.userId() }
          })

          return callWithPromise('updateStatus', {
              problemId: problem._id,
              status: 'closed'
          }).then(problemId => {
            let problem = Problems.findOne({ _id : problemId})
            assert.equal(problem.status, 'closed')
          })

      })

    it('can claim the problem if available', () => {
        let problem = Problems.findOne({})
        assert.ok(problem)

        Problems.update({ _id : problem._id }, {
            $set : { claimedBy : '', claimed: false }
        })

        return callWithPromise('claimProblem', {
            _id: problem._id,
        }).then(problemId => {
          let problem = Problems.findOne({ _id : problemId})
          assert.equal(problem.claimedBy, Meteor.userId())
        })
      })

    it('cannot claim the problem if already claimed', () => {
        let problem = Problems.findOne({})
        assert.ok(problem)

        Problems.update({ _id : problem._id }, {
            $set : { claimedBy : 'admin', claimed: true }
        })

        return callWithPromise('claimProblem', {
            _id: problem._id
        }).then(data => {
            assert.isNull(data)
        }).catch(err => {
            assert.include(err.message, 'You cannot claim a problem that is already claimed')
        })
      })

      it('can unclaim the problem if claimed by user', () => {
          let problem = Problems.findOne({})
          assert.ok(problem)

          Problems.update({ _id : problem._id }, {
              $set : { claimedBy : Meteor.userId(), claimed: true }
          })

          return callWithPromise('unclaimProblem', {
              _id: problem._id,
          }).then(problemId => {
            let problem = Problems.findOne({ _id : problemId})
            assert.equal(problem.claimedBy, undefined)
          })
        })

      it('cannot unclaim the problem if not claimed by user', () => {
          let problem = Problems.findOne({})
          assert.ok(problem)

          Problems.update({ _id : problem._id }, {
              $set : { claimedBy : 'admin', claimed: true }
          })

          return callWithPromise('unclaimProblem', {
              _id: problem._id
          }).then(data => {
              assert.isNull(data)
          }).catch(err => {
              assert.include(err.message, 'You cannot unclaim a problem that is not claimed by you')
          })
        })

      it('can edit the problem if user is creator', () => {
          let problem = Problems.findOne({})
          assert.ok(problem)

          Problems.update({ _id : problem._id }, {
              $set : { createdBy : Meteor.userId() }
          })

          return callWithPromise('editProblem', {
              id: problem._id,
              summary: 'This is a problem',
              description: 'This is a problem',
              solution: 'This is a problem'
          }).then(problemId => {
            let problem = Problems.findOne({ _id : problemId})
            assert.equal(problem.summary, 'This is a problem');
          })
        })

      it('cannot edit the problem if user is not creator', () => {
          let problem = Problems.findOne({})
          assert.ok(problem)

          Problems.update({ _id : problem._id }, {
              $set : { createdBy : '' }
          })

          return callWithPromise('editProblem', {
              id: problem._id,
              summary: 'This is a problem',
              description: 'This is a problem',
              solution: 'This is a problem'
          }).then(data => {
              assert.isNull(data)
          }).catch(err => {
              assert.include(err.message, 'You cannot edit a problem you did not create')
          })
        })

      it('can delete the problem if user is creator', () => {
          let problem = Problems.findOne({})
          assert.ok(problem)

          Problems.update({ _id : problem._id }, {
              $set : { createdBy : Meteor.userId() }
          })

          return callWithPromise('deleteProblem', {
              id: problem._id,
          }).then(problemId => {
            let problem = Problems.findOne({ _id : problemId})
            assert.equal(problem, undefined);
          })
        })

      it('cannot delete the problem if user is not creator', () => {
          let problem = Problems.findOne({})
          assert.ok(problem)

          Problems.update({ _id : problem._id }, {
              $set : { createdBy : '' }
          })

          return callWithPromise('deleteProblem', {
              id: problem._id
          }).then(data => {
              assert.isNull(data)
          }).catch(err => {
              assert.include(err.message, 'You cannot delete the problems you did not create')
          })
        })
    it ('users can subscribe to a problem', () => {
      let problem = Problems.findOne({})
      assert.ok(problem)

      callWithPromise('watchProblem', {
        _id: problem._id
      }).then(data => {
        let p = Problems.findOne({
          _id: problem._id
        })

        assert.notEqual(p.subscribers.indexOf(Meteor.userId()), -1)
      })
    })

    it ('users can unsubscribe from a problem', () => {
      let problem = Problems.findOne({})
      assert.ok(problem)

      callWithPromise('unwatchProblem', {
        _id: problem._id
      }).then(data => {
        let p = Problems.findOne({
          _id: problem._id
        })

        assert.equal(p.subscribers.indexOf(Meteor.userId()), -1)
      })
    })

    after(function() {
        Problems.remove({})
    })
})
