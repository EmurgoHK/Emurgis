import { Template } from "meteor/templating"
import { FlowRouter } from "meteor/kadira:flow-router"
import { notify } from "/imports/modules/notifier"

import { Comments } from "/imports/api/documents/both/commentsCollection.js"
import { deleteComment } from "/imports/api/documents/both/commentsMethods.js"

import swal from 'sweetalert'

import "./document-comments.html"

Template.documentComments.onCreated(function() {
  this.getDocumentId = () => FlowRouter.getParam("documentId")
  this.autorun(() => {
    this.subscribe("comments")
  })
})

Template.documentComments.onRendered(function() {})

Template.documentComments.onDestroyed(function() {})

Template.documentComments.helpers({
  isCommentOwner (comment) {
    return (comment.createdBy === Meteor.userId())
  }
})

Template.documentComments.events({
  'click .delete-comment' (event) {
    let element = $(event.target)

    swal({
      text: "Are you sure you want to delete this comment?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
      showCancelButton: true
    }).then(confirmed => {
      if (confirmed) {
        let commentId = element.data('comment-id')
        
        deleteComment.call({ commentId: commentId }, (err, response) => {
          if (err) {
            notify(err.message, 'error')
            return
          }

          notify('Comment successfully deleted', 'success')
        })
      }
  });
  }
})
