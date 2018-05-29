import { Template } from 'meteor/templating'
import './signin.html'

Template.signin.events({
  'submit #login': function(event) {
    event.preventDefault();
    // Log in the user here
  }
})
