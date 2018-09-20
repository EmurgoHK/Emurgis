import { Template } from "meteor/templating"
import { FlowRouter } from "meteor/kadira:flow-router"
import { updateProfile } from '/imports/api/user/both/userMethods.js'
import { notify } from "/imports/modules/notifier"

import './editProfile.html'

Template.editProfile.onCreated(function () {
  this.getUserId = () => FlowRouter.getParam("userId")
  this.autorun(() => {
    SubsCache.subscribe("users")
  })
})

Template.editProfile.helpers({
  user: () => {
    let userId = Template.instance().getUserId()
    let user = Meteor.users.findOne({ _id: userId })
    if (user) {
      let email = user.emails[0].address
      let emailVerified = user.emails[0].verified
      let fullName = user.profile.name
      return {
        fullName,
        email,
        emailVerified
      }
    }
  },
})

Template.editProfile.events({
  'submit #editProfileForm' (event, template){
    event.preventDefault();
    let data = {
      email : event.target.userEmail.value,
      name : event.target.fullName.value
    }
    updateProfile.call(data, (err, res) => {
      if(err){
        notify(err.message, 'error')
      } else {
        notify('Profile successfully updated', 'success')
      }
    })
  }
})