import { Template } from "meteor/templating"

// check if current user created the problem
Template.registerHelper("isProblemOwner", problemOwnerId => {
    if (problemOwnerId !== undefined && problemOwnerId === Meteor.userId()) { return true }
})

// check if current user has claimed problem
Template.registerHelper('hasClaimedProblem', claimedById => {
    if (claimedById !== undefined && claimedById === Meteor.userId()) { return true }
})