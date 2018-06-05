import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { Stats } from '/imports/api/stats/both/statsCollection.js'

import './userStats.html'

Template.userStats.onCreated(function() {
    this.autorun(() => {
        this.subscribe('users')
        this.subscribe('userStats')
    })
})

Template.userStats.helpers({
    users: () => Meteor.users.find({
        _id: {
            $ne: Meteor.userId()
        }
    }, {
        sort: {
            'profile.name': -1
        }
    }),
    stats: function () {
        return Stats.findOne({
            userId: this._id
        }) || {}
    },
    nullify: val => val || 0
})
