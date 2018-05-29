import { Template } from "meteor/templating"
import SimpleSchema from "simpl-schema"

import { notify } from "/imports/modules/notifier"
import { claimProblem } from "/imports/api/documents/both/problemMethods.js"

import "./documents-index-item.html"

Template.documentsIndexItem.onCreated(function() {
  this.getDocumentId = () => Template.instance().data.document._id
})

Template.documentsIndexItem.onRendered(function() {})

Template.documentsIndexItem.onDestroyed(function() {})

Template.documentsIndexItem.helpers({})

Template.documentsIndexItem.events({
    "click .js-delete-document" (event, instance) {
        event.preventDefault()

        if (confirm("Are you sure?")) {
            let documentId = Template.instance().getDocumentId()

            // problem deletion goes here
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
                            console.error(error)
                        }
                    }
                })

            }
        } else {
            notify("Must be logged in!", "error")
        }
    }
})
