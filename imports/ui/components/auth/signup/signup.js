import { Template } from 'meteor/templating'
import './signup.html'

Template.signup.events({
  'submit #signup': function(event) {
    event.preventDefault();
    // create new user here
  }
})
