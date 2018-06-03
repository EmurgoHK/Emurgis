import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { Stats } from '/imports/api/stats/both/statsCollection.js'

import './userStats.html'

Template.userStats.onCreated(function() {
    this.autorun(() => {
        let userId = FlowRouter.getParam('userId') || Meteor.userId()

        this.subscribe('userStats', userId)
        this.subscribe('user', userId)
    })
})

Template.userStats.helpers({
    stats: () => Stats.findOne({
        userId: FlowRouter.getParam('userId') || Meteor.userId()
    }) || {},
    username: () => ((Meteor.users.findOne({
        _id: FlowRouter.getParam('userId') || Meteor.userId()
    }) || {}).profile || {}).name,
    unclaimedPercentage: function() {
        return ((this.claimedProblems || []).length > 0 ? ((this.unclaimedProblems || []).length / this.claimedProblems.length) : 0) * 100
    },
    completedPercentage: function() {
        return ((this.claimedProblems || []).length > 0 ? ((this.completedProblems || []).length / this.claimedProblems.length) : 0) * 100
    },
    fixed: val => parseInt(val) !== val ? val.toFixed(2) : val, // fix decimal points only if there are some to prevent 100.00,
    nullify: val => val || 0
})
