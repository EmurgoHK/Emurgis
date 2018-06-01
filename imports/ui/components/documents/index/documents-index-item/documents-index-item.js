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
    statusText(val) {
        if (val && val === 'open') {
            return '<span class="badge badge-success">Open</span>'
        } else if (val && val === 'closed') {
            return '<span class="badge badge-danger">Closed</span>'
        } else if (val && val === 'in progress') {
            return '<span class="badge badge-secondary">In progress</span>'
        } else if (val && val === 'ready for review') {
            return '<span class="badge badge-primary">Ready for review</span>'
        } else {
            return '-'
        }
    }
})

Template.documentsIndexItem.events({
})
