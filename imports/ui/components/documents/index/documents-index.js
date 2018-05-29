import { Template } from "meteor/templating"
import { FlowRouter } from "meteor/kadira:flow-router"


import { Problems } from "/imports/api/documents/both/problemCollection.js"


import "./documents-index.html"
import "./documents-index-item/documents-index-item.js"

Template.documentsIndex.onCreated(function() {
  this.autorun(() => {
    this.subscribe("problems")
  });
});

Template.documentsIndex.onRendered(function() {})

Template.documentsIndex.onDestroyed(function() {})

Template.documentsIndex.helpers({
  problems() {
    return Problems.find({}, { sort: { createdAt: -1 } })
  }
})

Template.documentsIndex.events({
  'click #new-problem': function(event) {
    event.preventDefault();

    // make the check global later for checking if user is logged in
    if (Meteor.userId()) {
      FlowRouter.go('/new');
    } else {
      FlowRouter.go('/signin');
    }
  }
})
