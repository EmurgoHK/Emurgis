import { Template } from "meteor/templating"
import { Problems } from "/imports/api/documents/both/problemCollection.js"

import marked from 'marked';

// check if current user created the problem
Template.registerHelper("isProblemOwner", problemOwnerId => {
    return problemOwnerId !== undefined && problemOwnerId === Meteor.userId()
})

// check if current user has claimed problem
Template.registerHelper('hasClaimedProblem', claimedById => {
    if (claimedById !== undefined && claimedById === Meteor.userId()) { return true }
})

// get the users name by userId
Template.registerHelper('getNameById', userId => {
  	let getName = ((Meteor.users.findOne({_id: userId}) || {}).profile || {}).name
    return getName ? getName : null;
})

Template.registerHelper('md', content => {
    return  this.innerHTML = marked(content || '');
})

Template.registerHelper('statusText', status => {
    if (status && status === 'open') {
        return '<span class="badge badge-success problem-status-text">Open</span>'
    } else if (status && status === 'closed') {
        return '<span class="badge badge-danger">Fixed/solved</span>'
    } else if (status && status === 'in progress') {
        return '<span class="badge badge-secondary problem-status-text">In progress</span>'
    } else if (status && status === 'ready for review') {
        return '<span class="badge badge-primary problem-status-text">Ready for review</span>'
    } else if (status && status === 'rejected') {
        return '<span class="badge badge-danger">Rejected</span>'
    } else if (status && status === 'stale') {
        return '<span class="badge badge-warning">Stale</span>'
    } else {
        return '-'
    }
})

Template.registerHelper('getSummaryById', id => (Problems.findOne({ _id: id }) || {}).summary || '')

Template.registerHelper('getStatusById', id => (Problems.findOne({
    _id: id
}) || {}).status || '')
