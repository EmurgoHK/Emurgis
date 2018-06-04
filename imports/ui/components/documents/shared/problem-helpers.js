import { Template } from "meteor/templating"
import { Problems } from "/imports/api/documents/both/problemCollection.js"

// check if current user created the problem
Template.registerHelper("isProblemOwner", problemOwnerId => {
    if (problemOwnerId !== undefined && problemOwnerId === Meteor.userId()) { return true }
})

// check if current user has claimed problem
Template.registerHelper('hasClaimedProblem', claimedById => {
    if (claimedById !== undefined && claimedById === Meteor.userId()) { return true }
})

// get the users name by userId
Template.registerHelper('getNameById', userId => {
  	console.log(userId)
  	let getName = Meteor.users.findOne({_id: userId}).profile.name
    return getName ? getName : null;
})

Template.registerHelper('statusText', status => {
    if (status && status === 'open') {
        return '<span class="badge badge-success">Open</span>'
    } else if (status && status === 'closed') {
        return '<span class="badge badge-danger">This is fixed/solved</span>'
    } else if (status && status === 'in progress') {
        return '<span class="badge badge-secondary">In progress</span>'
    } else if (status && status === 'ready for review') {
        return '<span class="badge badge-primary">Ready for review</span>'
    } else {
        return '-'
    }
})
