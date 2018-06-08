import { Template } from 'meteor/templating'
import { notify } from '/imports/modules/notifier'

import { deleteProblem } from '/imports/api/documents/both/problemMethods'

import './reject-modal.html'

Template.rejectModal.onCreated(function() {
    this.getProblemId = () => FlowRouter.getParam('documentId')
})

Template.rejectModal.events({
    'submit': (event, templateInstance) => {
        event.preventDefault()

        if (!event.target.rejectionReason.value) {
            notify('You have to state a reason for rejection', 'error')
            return true
        }

        deleteProblem.call({ 
            id: templateInstance.getProblemId(),
            reason: event.target.rejectionReason.value
        }, (err, resp) => {
            if(err) { 
                notify(err.message, 'error') 
                return true
            }

            event.target.rejectionReason.value = ''

            $('#rejectModal').modal('hide')
            notify('Successfully rejected', 'success')
        })

        event.preventDefault()
    }
})