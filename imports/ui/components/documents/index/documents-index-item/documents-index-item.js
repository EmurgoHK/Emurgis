import { Template } from "meteor/templating"
import SimpleSchema from "simpl-schema"

import { notify } from "/imports/modules/notifier"
import { claimProblem, unclaimProblem, deleteProblem } from "/imports/api/documents/both/problemMethods.js"

import "./documents-index-item.html"

Template.documentsIndexItem.onCreated(function() {
  this.getDocumentId = () => Template.instance().data.document._id
})

Template.documentsIndexItem.onRendered(function() {})

Template.documentsIndexItem.onDestroyed(function() {})

Template.documentsIndexItem.helpers({
	isProblemOwner (ownerId) {
		if (ownerId !== undefined && ownerId === Meteor.userId()) { return true }
		return
	},
    claimButton(val) {

        if (this.document.claimed && this.document.claimedBy === Meteor.userId()) {
            return '<a class="btn btn-sm btn-primary unclaimProblem" href="#" role="button">Unclaim</a>'
        } else if (this.document.claimed) {
            return '<a class="btn btn-sm btn-success disabled" href="#" role="button">Claimed</a>'
        } else {
            return '<a class="btn btn-sm btn-success claimProblem" href="#" role="button">Claim</a>'
        }
    }
})

Template.documentsIndexItem.events({
    "click .js-delete-document" (event, instance) {
        event.preventDefault()

        if (confirm("Are you sure you want to delete this problem?")) {

            let problemId = Template.instance().getDocumentId()
            if (Meteor.userId()) {

             deleteProblem.call({ id: problemId }, (error, result) => {
                 if (error) {
                     if (error.details) {
                         console.error(error.details)
                     } else {
                       notify('Problem deleted successfully', 'success');
                     }
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
