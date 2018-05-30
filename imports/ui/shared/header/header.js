import './header.html'

Template.header.events({
    'click .sign-out': (event) => {
        event.preventDefault()

        if (Meteor.userId()) {
            Meteor.logout()   
        }
    }
})
