import { Template } from "meteor/templating"
import { FlowRouter } from "meteor/kadira:flow-router"

import { Problems } from "/imports/api/documents/both/problemCollection.js"

import "./document-show.html"

Template.documentShow.onCreated(function() {
  this.getDocumentId = () => FlowRouter.getParam("documentId")

  this.autorun(() => {
    this.subscribe("problems", this.getDocumentId())
  })
})

Template.documentShow.onRendered(function() {})

Template.documentShow.onDestroyed(function() {})

Template.documentShow.helpers({
  problem() {
    return Problems.findOne({ _id: Template.instance().getDocumentId() }) || {}
  }
})

Template.documentShow.events({})
