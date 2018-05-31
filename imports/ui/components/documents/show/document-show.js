import { Template } from "meteor/templating"
import { FlowRouter } from "meteor/kadira:flow-router"

import { Problems } from "/imports/api/documents/both/problemCollection.js"

import { Comments } from "/imports/api/documents/both/commentsCollection.js"
import { postComment } from "/imports/api/documents/both/commentsMethods.js"


import "./document-show.html"
import "./document-comments.html"
import "/imports/ui/components/documents/shared/problem-helpers.js"

Template.documentShow.onCreated(function() {
  this.getDocumentId = () => FlowRouter.getParam("documentId")

  this.autorun(() => {
    this.subscribe("problems", this.getDocumentId())
    this.subscribe("comments", this.getDocumentId())
  })
})

Template.documentShow.onRendered(function() {})

Template.documentShow.onDestroyed(function() {})

Template.documentShow.helpers({
  problem() {
    return Problems.findOne({ _id: Template.instance().getDocumentId() }) || {}
  },
   comments() {
    return Comments.find({ problemId: Template.instance().getDocumentId() }) || {}
  }
})

Template.documentShow.events({

    "click .documentCommentBtn" (event, instance) {
        event.preventDefault()

        if (Meteor.userId()){
                let problemId = Template.instance().getDocumentId()
                var commentValue = $('#comments').val();

                postComment.call({
                    problemId: problemId,
                    comment: commentValue
                }, (error, result) => {
                    if (error) {
                        if (error.details) {
                            console.error(error.details)
                        } else {
                            console.error(error)
                        }
                    }else{
                    	$('#comments').val("");
                    }
                })

            } else {
                notify("Must be logged in!", "error")
            }
    },


})
