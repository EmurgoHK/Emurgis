import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import './userList.html'

import { resetHiddenModals } from '/imports/api/user/both/userMethods'
import { notify } from '/imports/modules/notifier'

Template.userList.onCreated(function() {
    this.autorun(() => {
        this.subscribe('users')
    })
})

Template.userList.helpers({
    users: () => Meteor.users.find({}, {
        sort: {
            'profile.name': 1
        }
    })
})

Template.userList.events({
    'click .reset': function(event, templateInstance) {
        event.preventDefault()

        resetHiddenModals.call({
            userId: this._id
        }, (err, data) => {
            if (err) {
                notify(err.reason || err.message, 'error')
            } else {
                notify('Successfully reset.', 'success')
            }
        })
    }
})
