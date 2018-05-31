import { Template } from "meteor/templating"
import SimpleSchema from "simpl-schema"

import { notify } from "/imports/modules/notifier"
import { claimProblem, unclaimProblem, deleteProblem } from "/imports/api/documents/both/problemMethods.js"

import "./documents-index-item.html"
import "/imports/ui/components/documents/shared/problem-helpers.js"

Template.documentsIndexItem.onCreated(function() {
  this.getDocumentId = () => Template.instance().data.document._id
})

Template.documentsIndexItem.onRendered(function() {})

Template.documentsIndexItem.onDestroyed(function() {})

Template.documentsIndexItem.helpers({
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
})
