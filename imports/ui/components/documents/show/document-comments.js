import { Template } from "meteor/templating"
import { FlowRouter } from "meteor/kadira:flow-router"

//import { Problems } from "/imports/api/documents/both/problemCollection.js"

import "./document-comments.html"

Template.documentComments.onCreated(function() {
  this.getDocumentId = () => FlowRouter.getParam("documentId")

  // this.autorun(() => {
  //   this.subscribe("problems", this.getDocumentId())
  // })
})

Template.documentComments.onRendered(function() {})

Template.documentComments.onDestroyed(function() {})

Template.documentComments.helpers({
  comments() {
   // return Problems.findOne({ _id: Template.instance().getDocumentId() }) || {}
  }
})

Template.documentComments.events({})
