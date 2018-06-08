import { Template } from "meteor/templating"
import SimpleSchema from "simpl-schema"

import { notify } from "/imports/modules/notifier"
import { claimProblem, unclaimProblem, deleteProblem } from "/imports/api/documents/both/problemMethods.js"

import { Dependencies } from '/imports/api/documents/both/dependenciesCollection'
import { Comments } from "/imports/api/documents/both/commentsCollection.js"

import "./documents-index-item.html"
import "/imports/ui/components/documents/shared/problem-helpers.js"

Template.documentsIndexItem.onCreated(function() {
  this.getDocumentId = () => this.data.document._id

  this.autorun(() => {
  	this.subscribe('dependenciesProblem', this.getDocumentId())
    this.subscribe("comments", this.getDocumentId())
  })
})

Template.documentsIndexItem.onRendered(function() {})

Template.documentsIndexItem.onDestroyed(function() {})

Template.documentsIndexItem.helpers({
	//count number of comments against the problem
    numberOfComments(problemId) {
        return Comments.find({problemId:problemId}).count();
    },
    blocking: () => Dependencies.find({
    	dependencyId: Template.instance().getDocumentId()
    }).count()
})

Template.documentsIndexItem.events({
})
