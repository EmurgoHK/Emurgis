import { notify } from "/imports/modules/notifier"

import { addTag, removeTag } from '/imports/api/user/both/userMethods'

import './usernameModal.html'

Template.usernameModal.onCreated(function () {
})

Template.usernameModal.helpers({
  usernames() {
    if (Meteor.user()) {
      return Meteor.user().profile.tags;
    }
    return []
  }
})

Template.usernameModal.events({
  'click .add-username': (event) => {
    if ($('.username-input').val()) {

      // call the add username feature here
      addTag.call({
        userId: Meteor.userId(),
        tag: $('.username-input').val().trim()
      }, (err, res) => {
        if (err) {
          console.log(err)
          return
        }
      })
    }
  },
  'click .remove-username': (event) => {
      if (event.target.id) {
        // call the remove username here
        removeTag.call({
          userId: Meteor.userId(),
          tag: event.target.id.trim()
        }, (err, res) => {
          if (err) {
            console.log(err)
            return
          }
        })
      }
  }
})
