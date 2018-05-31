import { Template } from "meteor/templating"
import { FlowRouter } from "meteor/kadira:flow-router"

import { Problems } from "/imports/api/documents/both/problemCollection.js"
import { claimProblem, unclaimProblem, deleteProblem } from "/imports/api/documents/both/problemMethods.js"

import { Comments } from "/imports/api/documents/both/commentsCollection.js"
import { postComment } from "/imports/api/documents/both/commentsMethods.js"


import "./document-show.html"
import "./document-comments.html"

Template.documentShow.onCreated(function() {
  this.getDocumentId = () => FlowRouter.getParam("documentId")

  this.autorun(() => {
    this.subscribe("problems", this.getDocumentId())
    this.subscribe("comments", this.getDocumentId())
  })
})

Template.documentShow.onRendered(function() {})

Template.documentShow.onDestroyed(function() {})

Template.documentShow.helpers({
  problem() {
    return Problems.findOne({ _id: Template.instance().getDocumentId() }) || {}
  },
   comments() {
    return Comments.find({ problemId: Template.instance().getDocumentId() }) || {}
  },
	isProblemOwner (ownerId) {
		if (ownerId !== undefined && ownerId === Meteor.userId()) { return true }
		return false
	},
  claimButton(problem) {
      if (problem.claimed && problem.claimedBy === Meteor.userId()) {
          return '<a class="btn btn-sm btn-primary unclaimProblem" href="#" role="button">Unclaim</a>'
      } else if (problem.claimed) {
          return '<a class="btn btn-sm btn-success disabled" href="#" role="button">Claimed</a>'
      } else {
          return '<a class="btn btn-sm btn-success claimProblem" href="#" role="button">Claim</a>'
      }
  }
})

Template.documentShow.events({

    "click .documentCommentBtn" (event, instance) {
        event.preventDefault()

        if (Meteor.userId()){
                let problemId = Template.instance().getDocumentId()
                var commentValue = $('#comments').val();

                postComment.call({
                    problemId: problemId,
                    comment: commentValue
                }, (error, result) => {
                    if (error) {
                        if (error.details) {
                            console.error(error.details)
                        } else {
                            console.error(error)
                        }
                    }else{
                    	$('#comments').val("");
                    }
                })

            } else {
                notify("Must be logged in!", "error")
            }
    },

    "click .js-delete-document" (event, instance) {
        event.preventDefault()

        if (confirm("Are you sure you want to delete this problem?")) {

            let problemId = Template.instance().getDocumentId()
            if (Meteor.userId()) {

             deleteProblem.call({ id: problemId }, (error, result) => {
                 if (error) {
                     if (error.details) {
                         console.error(error.details)
                     }
                 } else {
                   FlowRouter.go('/');
                 }
             })
            }
        }
    },

    "click .claimProblem" (event, instance) {
        event.preventDefault()

        if (Meteor.userId()) {

            if (confirm("Are you sure you want to claim this problem?")) {
                let problemId = Template.instance().getDocumentId()

                claimProblem.call({
                    _id: problemId
                }, (error, result) => {
                    if (error) {
                        if (error.details) {
                            console.error(error.details)
                        } else {
                            notify('Problem claimed successfully', 'success');
                        }
                    }
                })

            }
        } else {
            notify("Must be logged in!", "error")
        }
    },

    "click .unclaimProblem" (event, instance) {
        event.preventDefault()

        if (Meteor.userId()) {

            if (confirm("Are you sure you want to unclaim this problem?")) {
                let problemId = Template.instance().getDocumentId()

                unclaimProblem.call({
                    _id: problemId
                }, (error, result) => {
                    if (error) {
                        if (error.details) {
                            console.error(error.details)
                        } else {
                            notify('Problem unclaimed successfully', 'success');
                        }
                    }
                })

            }
        } else {
            notify("Must be logged in!", "error")
        }
    }

})
