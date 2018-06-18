import { chai, assert } from 'chai'
import { Meteor } from 'meteor/meteor'
import { Dependencies } from "./dependenciesCollection.js"
import { Problems } from './problemCollection'
import { callWithPromise } from '/imports/api/utilities'
import './dependenciesMethods.js'

Meteor.userId = () => 'test-user' // override the meteor userId, so we can test methods that require a user
Meteor.users.findOne = () => ({ profile: { name: 'Test User'} }) // stub user data as well
Meteor.user = () => ({ profile: { name: 'Test User'} })

describe('dependency methods', () => {
    beforeEach(() => {
        let pId = Problems.insert({
            summary: "Derp",
            description: "Lorem ipsum, herp derp durr.",
            solution: "Lorem ipsum, herp derp durr.",
            createdAt: new Date().getTime(),
            createdBy: ''
        })

        Dependencies.insert({
            problemId: pId,
            dependencyId: '12345',
            createdAt: new Date().getTime(),
            createdBy: ''
        })
    })

    it('problem\'s owner can delete a dependency', () => {
        let dependencies = Dependencies.findOne({})
        assert.ok(dependencies)

        Problems.update({ _id : dependencies.problemId }, {
            $set : { createdBy : Meteor.userId() }
        })

        return callWithPromise('deleteDependency', {
            id: dependencies._id
        }).then(dId => {
            let dependency = Dependencies.findOne({ _id : dId})
            assert.equal(dependency, undefined)
        })

    })

    it('other users can\'t delete dependencies', () => {
      let dependencies = Dependencies.findOne({})
      assert.ok(dependencies)

      Dependencies.update({ _id : dependencies._id }, {
          $set : { createdBy : '' }
      })

      return callWithPromise('deleteDependency', {
          id: dependencies._id
      }).then(data => {
          assert.isNull(data)
      }).catch(err => {
          assert.include(err.message, 'You cannot delete the problems you did not create')
      })
    });

    it('user can\'t add a circular dependency', () => {
      let dependencies = Dependencies.findOne({})
      assert.ok(dependencies)

      let problem = Problems.findOne({})
      assert.ok(problem)

      return callWithPromise('addDependency', {
          pId: dependencies._id,
          dId: problem._id
      }).then(data => {
          assert.equal(data, undefined)
      }).catch(err => {
          assert.include(err.message, 'Dependency tree can\'t contain cycles.')
      })
    });

    after(function() {
        Dependencies.remove({})
        Problems.remove({})
    })
})
