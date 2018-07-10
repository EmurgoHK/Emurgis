import { Template } from "meteor/templating"
import { FlowRouter } from "meteor/kadira:flow-router"
import { notify } from "/imports/modules/notifier"

import { Comments } from "/imports/api/documents/both/commentsCollection.js"
import { deleteComment, editComment, removeCommentImage, likeComment } from "/imports/api/documents/both/commentsMethods.js"

import swal from 'sweetalert'
import pluralize from 'pluralize'

import "./document-comments.html"
import { Meteor } from "meteor/meteor";

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
  isLiked (comment) {
    if (comment.likes && comment.likes.includes(Meteor.userId())) {
      return true
    }
  },
  likeCount (comment) {
    let count = 0

    if (comment.likes) 
      count = comment.likes.length
      
    return pluralize('person', count, true)
  },
  commentLikes (comment) {
    if (comment.likes) { 
      let users = comment.likes.map((userId, _idx) => {
        return Meteor.users.findOne({ _id : userId }).profile.name
      }) 

      console.log(typeof(users))
      return users
    }

    return []
  },
  editMode: () => Template.instance().editMode.get()
})

Template.documentComments.events({
  'click .like-count': (event) => {
    event.preventDefault()

    let commentId = $(event.currentTarget).data('comment-id');
    let comment = Comments.findOne({ _id : commentId });
    let modalBody = $('#commentLikes').find('.modal-body')

    // clear body text and set likes count to 0
    modalBody.html(' ')
    $('.likes-count').html(0)

    if (comment.likes) {
      // if comment has likes we update likes count text
      // and attach an unordered html list to modal body
      $('.likes-count').html(comment.likes.length)
      modalBody.html('<ul class="list-unstyled"></ul>');
      
      for (let i = 0; i < comment.likes.length; i++) {
        // loop through likes and find user by id
        let user = Meteor.users.findOne({ _id : comment.likes[i] })

        // append li element to list with the user's name
        modalBody.find('ul.list-unstyled').append('<li>' + user.profile.name + '</li>')
      }
    }

    // show modal
    $('#commentLikes').modal('show')
  },
  'click .like-comment': (event) => {
    event.preventDefault();
    let commentId = $(event.currentTarget).data('comment-id');

    likeComment.call({
      commentId: commentId
    }, (err, _data) => {
      if (err) {
        console.log(err)
        return
      }

      console.log("this one has been liked")
    })
  },
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
