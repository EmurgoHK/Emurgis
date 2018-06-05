import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { Problems } from '/imports/api/documents/both/problemCollection'

import './documents-claimed.html'
import './documents-index-item/documents-index-item'

Template.documentsClaimed.onCreated(function() {
    this.projectStatusTypes = new ReactiveVar(['in progress', 'ready for review'])

    this.filter = new ReactiveVar({})

    this.autorun(() => {
        this.subscribe('problems')

        this.filter.set({
            status: {
                $in: Template.instance().projectStatusTypes.get()
            },
            claimedBy: Meteor.userId()
        })
    })
})

Template.documentsClaimed.helpers({
    problems: () => Problems.find(Template.instance().filter.get(), {
        sort: {
            createdAt: -1
        }
    })
})

Template.documentsClaimed.events({
    'click .projectFiltersPanel': (event, templateInstance) => {
        let projectStatusTypes = templateInstance.$('.projectFiltersPanel input:checked').map(function() {
            return $(this).val()
        })
        
        templateInstance.projectStatusTypes.set($.makeArray(projectStatusTypes))
    }
})