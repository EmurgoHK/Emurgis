import { Template } from 'meteor/templating'
import { FlowRouter } from "meteor/kadira:flow-router"
import { notify } from "/imports/modules/notifier"

import './signin.html'

Template.signin.events({
  'submit #login': function(event) {
    event.preventDefault();
    // Log in the user here
  },

  'click #google-login': (event) => {
    event.preventDefault();

    Meteor.loginWithGoogle({}, (err) => {
      if (err) { 
        notify("Invalid login", "error")
        return 
      }
      var redirectTo = window.last || '/'
      FlowRouter.go(redirectTo)
    })
  }
})
