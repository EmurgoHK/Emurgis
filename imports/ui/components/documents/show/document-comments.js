import { Template } from "meteor/templating"
import { FlowRouter } from "meteor/kadira:flow-router"
import { notify } from "/imports/modules/notifier"

import { Comments } from "/imports/api/documents/both/commentsCollection.js"
import { deleteComment, editComment, removeCommentImage } from "/imports/api/documents/both/commentsMethods.js"

import swal from 'sweetalert'

import "./document-comments.html"

Template.documentComments.onCreated(function() {
  this.getDocumentId = () => FlowRouter.getParam("documentId")
  this.editMode = new ReactiveVar(false)

  this.autorun(() => {
    SubsCache.subscribe("comments")
  })
})

Template.documentComments.onRendered(function() {})

Template.documentComments.onDestroyed(function() {})

Template.documentComments.helpers({
  isCommentOwner (comment) {
    return (comment.createdBy === Meteor.userId())
  },
  editMode: () => Template.instance().editMode.get()
})

Template.documentComments.events({
  'click .edit-mode': (event, templateInstance) => {
    event.preventDefault()

    templateInstance.editMode.set(true)
  },
  'click .cancel-edit': (event, templateInstance) => {
    event.preventDefault()

    templateInstance.editMode.set(false)
  },
  'click .remove-comment-image': (event, templateInstance) => {
    event.preventDefault()

    removeCommentImage.call({
      commentId: $(event.currentTarget).data('id'),
      image: $(event.currentTarget).data('image')
    }, (err, data) => {
      if (err) {
        console.log(err)
      }
    })
  },
  'click .edit-comment' (event, templateInstance) {
    let element = $(event.target)

    swal({
      text: "Are you sure you want to save changes to this comment?",
      icon: "warning",
      buttons: true,
      dangerMode: true
    }).then(confirmed => {
      if (confirmed) {
        editComment.call({
          commentId: templateInstance.data.comment._id,
          comment: $('#js-comment').val()
        }, (err, response) => {
          if (err) {
            notify(err.message, 'error')
            return
          }

          templateInstance.editMode.set(false)

          notify('Comment successfully edited', 'success')
        })
      }
  })
  },
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
