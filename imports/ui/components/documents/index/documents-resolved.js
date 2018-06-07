import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { Problems } from '/imports/api/documents/both/problemCollection'

import './documents-resolved.html'
import './documents-index-item/documents-index-item'

Template.documentsResolved.onCreated(function() {
    this.autorun(() => {
        this.subscribe('problems')
    })
})

Template.documentsResolved.helpers({
    problems: () => Problems.find({
        createdBy: Meteor.userId(),
        status: 'ready for review'
    }, {
        sort: {
            createdAt: -1
        }
    })
})
