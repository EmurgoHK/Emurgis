import { notify } from "/imports/modules/notifier"

import './signInModal.html'

Template.signInModal.onCreated(function () {
  const instance = this
  instance.status = new ReactiveVar('signIn')
})

Template.signInModal.helpers({
  isRegister() {
    return Template.instance().status.get() == 'signUp'
  }
})

Template.signInModal.events({
  'click .register-link' (event, instance) {
    event.preventDefault()
    instance.status.set('signUp')
  },
  'click .login-link' (event, instance) {
    event.preventDefault()
    instance.status.set('signIn')
  },
  'submit #signInForm' (event, instance) {
    event.preventDefault()
    const email = $('#email').val()
    const fullName = $('#fullName').val()
    const userName = $('#userName').val()
    const userDob = $('#userDob').val()
    const password = $('#password').val()
    const status = instance.status.get()
    if (email && password) {
      if (status == 'signUp') {
        const profile = {
          name: fullName,
          dob : new Date(userDob).getTime(),
          tags : [userName]
        } 
        Accounts.createUser({email, password, profile}, (error, result) => {
          if (error) notify(error.message, "error")
          else {
            Meteor.loginWithPassword(email, password, (error, result) => {
              if (error) notify(error.message, "error")
              else {
                notify("User logged in", "success")
                $('#signInForm')[0].reset()
                $('#signInModal').modal('hide')
                instance.status.set('signIn')
                const redirectTo = window.last || '/'
                FlowRouter.go(redirectTo)
              }
            })
          }
        })
      } else {
        Meteor.loginWithPassword(email, password, (error, result) => {
          if (error) notify(error.message, "error")
          else {
            notify("User logged in", "success")
            $('#signInForm')[0].reset()
            $('#signInModal').modal('hide')
            instance.status.set('signIn')
            const redirectTo = window.last || '/'
            FlowRouter.go(redirectTo)
          }
        })
      }
    } else {
      notify("Email and password are required", "error")
    }
  }
})
