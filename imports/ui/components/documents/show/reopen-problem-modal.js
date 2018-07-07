import { Template } from 'meteor/templating'
import { notify } from '/imports/modules/notifier'
import { reopenProblem } from '/imports/api/documents/both/problemMethods'

import './reopen-problem-modal.html'

Template.reopenProblemModal.onCreated(function() {
    this.getProblemId = () => FlowRouter.getParam('documentId')
  
    this.autorun(() => {
        SubsCache.subscribe('problems', this.getProblemId())
    })
})

Template.reopenProblemModal.events({
    'submit': (event, templateInstance) => {
        event.preventDefault()

        reopenProblem.call({ 
            problemId: Template.instance().getProblemId(), 
            reason : event.target.reopenReason.value 
        }, (err, response) => {
            if (!err) { 
                $('#reopenProblemModal').modal('hide')
                return
            }

            notify(err.message, 'error')
        })
    }
})