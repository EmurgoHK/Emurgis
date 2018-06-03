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
})

Template.documentsIndexItem.events({
})
