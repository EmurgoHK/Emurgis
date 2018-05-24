import { Template } from "meteor/templating"

import { Documents } from "/imports/api/documents/both/document-collection.js"

import "./documents-index.html"
import "./documents-index-item/documents-index-item.js"

Template.documentsIndex.onCreated(function() {
  function bodyOnCreated() {
      this.subscribe("problems")
  }
})

Template.documentsIndex.onRendered(function() {})

Template.documentsIndex.onDestroyed(function() {})

Template.documentsIndex.helpers({
  problems() {
    return Problems.find({}, { sort: { createdAt: -1 } })
  }
})

Template.documentsIndex.events({})
