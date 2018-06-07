import { chai, assert } from 'chai'
import { Meteor } from 'meteor/meteor'
import { Dependencies } from "./dependenciesCollection.js"
import { callWithPromise } from '/imports/api/utilities'
import './dependenciesMethods.js'

Meteor.userId = () => 'test-user' // override the meteor userId, so we can test methods that require a user
Meteor.users.findOne = () => ({ profile: { name: 'Test User'} }) // stub user data as well
Meteor.user = () => ({ profile: { name: 'Test User'} })

describe('dependency methods', () => {
    beforeEach(() => {
        Dependencies.insert({
            problemId: '54321',
            dependencyId: '12345',
            createdAt: new Date().getTime(),
            createdBy: ''
        })
    })

    it('can delete dependency if owner of problem', () => {
        let dependencies = Dependencies.findOne({})
        assert.ok(dependencies)

        Dependencies.update({ _id : dependencies._id }, {
            $set : { createdBy : Meteor.userId() }
        })

        return callWithPromise('deleteDependency', {
            id: dependencies._id
        }).then(dId => {
            let dependency = Dependencies.findOne({ _id : dId})
            assert.equal(dependency, undefined)
        })

    })

    it('cannot delete dependency if not owner', () => {
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

    after(function() {
        Dependencies.remove({})
    })
})
