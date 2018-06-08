import { Template } from "meteor/templating"
import { notify } from "/imports/modules/notifier"
import { rejectSolution } from "/imports/api/documents/both/problemMethods.js"

import './reject-solution-modal.html'

Template.rejectSolutionModal.onCreated(function() {
    this.getProblemId = () => FlowRouter.getParam("documentId")
  
    this.autorun(() => {
      this.subscribe("problems", this.getProblemId())
    })
})

Template.rejectSolutionModal.events({
    'submit'(event) {
        event.preventDefault();
        rejectSolution.call({ 
            problemId : Template.instance().getProblemId(), 
            rejectReason : event.target.rejectReason.value 
        }, (err, response) => {
            if (!err) { 
                $('#rejectSolutionModal').modal('hide')
                return
            }

            notify(err.message, 'error')
        })
    }
})