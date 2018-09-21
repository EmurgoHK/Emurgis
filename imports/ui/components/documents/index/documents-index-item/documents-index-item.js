import { Template } from "meteor/templating"
import SimpleSchema from "simpl-schema"

import { notify } from "/imports/modules/notifier"
import { claimProblem, unclaimProblem, deleteProblem } from "/imports/api/documents/both/problemMethods.js"

import { Dependencies } from '/imports/api/documents/both/dependenciesCollection'
import { Problems } from '/imports/api/documents/both/problemCollection'
import { Comments } from "/imports/api/documents/both/commentsCollection.js"

import "./documents-index-item.html"
import "/imports/ui/components/documents/shared/problem-helpers.js"

Template.documentsIndexItem.onCreated(function() {
  this.getDocumentId = () => this.data.document._id

  this.autorun(() => {
  	SubsCache.subscribe('dependenciesProblem', this.getDocumentId())
    SubsCache.subscribe("comments", this.getDocumentId())
    SubsCache.subscribe('problems')
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
    }).count(),
    blocked: () => !Dependencies.find({
    	problemId: Template.instance().getDocumentId()
    }).fetch().every(i => {
    	let problem = Problems.findOne({
    		_id: i.dependencyId
    	}) || {}

    	return problem.status === 'closed' || problem.status === 'rejected'
    })
})

Template.documentsIndexItem.events({
      'click .documents-index-item': function(event) {
    event.preventDefault();

     FlowRouter.go('/'+this.document._id);

  },
})

Template.documentsItem.onCreated(function() {
  this.getDocumentId = () => this.data.document._id

  this.autorun(() => {
  	SubsCache.subscribe('dependenciesProblem', this.getDocumentId())
    SubsCache.subscribe("comments", this.getDocumentId())
    SubsCache.subscribe('problems')
  })
})

Template.documentsItem.helpers({
  numberOfComments(problemId) {
    return Comments.find({problemId:problemId}).count();
  },
  blocking: () => Dependencies.find({
    dependencyId: Template.instance().getDocumentId()
  }).count(),
  blocked: () => !Dependencies.find({
    problemId: Template.instance().getDocumentId()
  }).fetch().every(i => {
    let problem = Problems.findOne({
      _id: i.dependencyId
    }) || {}
    return problem.status === 'closed' || problem.status === 'rejected'
  })
})