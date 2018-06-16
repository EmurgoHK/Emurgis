import { Template } from "meteor/templating"
import { FlowRouter } from "meteor/kadira:flow-router"
import { notify } from "/imports/modules/notifier"
import swal from 'sweetalert'

import { Problems } from "/imports/api/documents/both/problemCollection.js"
import { Comments } from "/imports/api/documents/both/commentsCollection.js"


import "./userProfile.html"

Template.userProfile.onCreated(function() {
  this.getUserId = () => FlowRouter.getParam("userId")

  this.autorun(() => {
    this.subscribe("problems")
    this.subscribe("users")
    this.subscribe("comments")
  })
})

Template.userProfile.onRendered(function() {})

Template.userProfile.onDestroyed(function() {})

Template.userProfile.helpers({
  user: () => {
    let userId = Template.instance().getUserId()
    return Meteor.users.findOne({ _id: userId });
  },
  comments: () => {
    let userId = Template.instance().getUserId()
    console.log(Template.instance().getUserId())
    return Comments.find({ createdBy: userId }, { sort: { createdAt: -1 } });
  },
  solvedProblems: () => {
    let userId = Template.instance().getUserId()
    return Problems.find({ resolved : true, resolvedBy: userId }, { sort: { resolvedDateTime: -1 } })
  },
  claimedProblems: () => {
    let userId = Template.instance().getUserId()
    return Problems.find({ claimedBy: userId }, { sort: { claimedDateTime: -1 } })
  },
  loggedProblems: () => {
    let userId = Template.instance().getUserId()
    return Problems.find({ createdBy: userId }, { sort: { createdAt: -1 } })
  },
  closedProblems: () => {
    let userId = Template.instance().getUserId()
    return Problems.find({ createdBy: userId, status: 'closed' }, { sort: { createdAt: -1 } })
  }
})

Template.userProfile.events({

})
