import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { Problems } from '/imports/api/documents/both/problemCollection'

import './documents-logged.html'
import './documents-index-item/documents-index-item'

Template.documentsLogged.onCreated(function() {
    this.projectStatusTypes = new ReactiveVar([])

    this.autorun(() => {
        FlowRouter.watchPathChange()

        const rejectedOnly = (FlowRouter.current().route || {}).name === 'documentsRejected'

        this.projectStatusTypes.set(rejectedOnly ? ['rejected'] : ['in progress', 'ready for review', 'open', 'rejected'])
    })

    this.filter = new ReactiveVar({})

    this.autorun(() => {
        SubsCache.subscribe('problems')

        this.filter.set({
            status: {
                $in: Template.instance().projectStatusTypes.get()
            },
            createdBy: Meteor.userId()
        })
    })
})

Template.documentsLogged.onRendered(function() {
    this.autorun(() => {
        ['open', 'in progress', 'ready for review', 'closed', 'rejected'].forEach(i => $(`:checkbox[value="${i}"]`).prop('checked', ~this.projectStatusTypes.get().indexOf(i))) // dynamically check them
    })
})

Template.documentsLogged.helpers({
    problems: () => Problems.find(Template.instance().filter.get(), {
        sort: {
            createdAt: -1
        }
    })
})

Template.documentsLogged.events({
    'click .projectFiltersPanel': (event, templateInstance) => {
        let projectStatusTypes = templateInstance.$('.projectFiltersPanel input:checked').map(function() {
            return $(this).val()
        })
        
        templateInstance.projectStatusTypes.set($.makeArray(projectStatusTypes))
    }
})