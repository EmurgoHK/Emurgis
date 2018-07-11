import { chai, assert } from 'chai'
import { Meteor } from 'meteor/meteor'

import './userMethods'
import { isModerator } from './userMethods'

/*const testUser = (function() {
    this.user = {
        profile: {
            name: 'Test User'
        }
    }

    return {
        set: (user) => {
            this.user = user
        },
        get: () => {
            return this.user
        }
    }
})();*/

import { callWithPromise } from '/imports/api/utilities'

Meteor.userId = () => 'test-user' // override the meteor userId, so we can test methods that require a user
Meteor.users.findOne = () => {
    profile: {
        name: 'Test User'
    }
}

Meteor.users.update = (sel, mod) => { // simulate how mongo does updates
    if (sel === Meteor.userId() || sel._id === Meteor.userId()) {
        let newObj = {}

        if (mod['$set']) {
            Object.keys(mod['$set']).forEach(i => {
                if (i.indexOf('.') !== -1) { // in case modifier is, for example, 'profile.name'
                    let all = i.split('.')

                    let curObj = mod['$set'][i]

                    all.reverse().forEach((j, ind) => { // build the object bottom up
                        if (ind === all.length - 1) {
                            newObj[j] = _.extend(newObj[j] || {}, curObj)
                        }

                        curObj = {
                            [j]: curObj
                        }
                    })
                } else {
                    newObj[i] = mod['$set'][i]
                }
            })
        }

        if (mod['$addToSet'] || mod['$push']) {
            Object.keys(mod['$addToSet'] || mod['$push']).forEach(i => {
                if (i.indexOf('.') !== -1) {
                    let all = i.split('.')

                    let curObj = [(mod['$addToSet'] || mod['$push'])[i]]

                    all.reverse().forEach((j, ind) => { // build the object bottom up
                        if (ind === all.length - 1) {
                            newObj[j] = _.extend(newObj[j] || {}, curObj)
                        }

                        curObj = {
                            [j]: curObj
                        }
                    })
                } else {
                    newObj[i] = [(mod['$addToSet'] || mod['$push'])[i]]
                }
            })
        }

        if (mod['$pull']) {
            Object.keys(mod['$pull']).forEach(i => {
                if (i.indexOf('.') !== -1) { // in case modifier is, for example, 'profile.name'
                    let all = i.split('.')

                    let curObj = []

                    all.reverse().forEach((j, ind) => { // build the object bottom up
                        if (ind === all.length - 1) {
                            newObj[j] = _.extend(newObj[j] || {}, curObj)
                        }

                        curObj = {
                            [j]: curObj
                        }
                    })
                } else {
                    newObj[i] = []
                }
            })
        }

        // hacky solution that seems to work properly here, basically, the main problem is reference sharing between multiple js files and this seems to solve it
        let old = Meteor.users.findOne()
        Meteor.users.findOne = () => _.extend(old, newObj)
    }
}

describe('User methods', () => {
    it('User can provide his/her DOB', () => {
        let date = new Date()

        return callWithPromise('provideDob', {
            dob: date
        }).then(() => {
            let user = Meteor.users.findOne({
                _id: Meteor.userId()
            })

            assert.ok(user)

            assert.ok(user.profile.dob === new Date(date).getTime())
        })
    })

    it('isModerator check works', () => {
        assert.notOk(isModerator(Meteor.userId()))

        Meteor.users.update({
            _id: Meteor.userId()
        }, {
            $set: {
                moderator: true
            }
        })

        assert.ok(isModerator(Meteor.userId()))
    })

    it('user can hide a help modal', () => {
        return callWithPromise('hideHelpModal', {
            helpModalId: 'test-id'
        }).then(data => {
            let user = Meteor.users.findOne({
                _id: Meteor.userId()
            })

            assert.ok(user)

            assert.ok(~user.hidden.indexOf('test-id'))
        })
    })

    it('moderator can reset modal status', () => {
        return callWithPromise('resetHiddenModals', {
            userId: Meteor.userId()
        }).then(data => {
            let user = Meteor.users.findOne({
                _id: Meteor.userId()
            })

            assert.ok(user)

            assert.ok(user.hidden.length === 0)
        })
    })

    it('user can add a tag', () => {
        return callWithPromise('addTag', {
            userId: Meteor.userId(),
            tag: 'test-tag'
        }).then(data => {
            let user = Meteor.users.findOne({
                _id: Meteor.userId()
            })

            assert.ok(user)

            assert.ok(~user.profile.tags.indexOf('test-tag'))
        })
    })

    it('user can remove a tag', () => {
        return callWithPromise('removeTag', {
            userId: Meteor.userId(),
            tag: 'test-tag'
        }).then(data => {
            let user = Meteor.users.findOne({
                _id: Meteor.userId()
            })

            assert.ok(user)

            assert.ok(!~user.profile.tags.indexOf('test-tag'))
        })
    })

    it('default flag can be set', () => {
        return callWithPromise('defaultTagAddedFlag', {
            defaultTagAdded: true
        }).then(data => {
            let user = Meteor.users.findOne({
                _id: Meteor.userId()
            })

            assert.ok(user)

            assert.ok(user.profile.defaultTagAdded)
        })
    })
})
