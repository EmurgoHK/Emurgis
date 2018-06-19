import { Template } from "meteor/templating"
import { notify } from "/imports/modules/notifier"

import { Problems } from "/imports/api/documents/both/problemCollection.js"
import { markAsResolved } from "/imports/api/documents/both/problemMethods.js"

import "./resolved-modal.html"

Template.resolvedModal.onCreated(function() {
    this.getProblemId = () => FlowRouter.getParam("documentId")
  
    this.autorun(() => {
      SubsCache.subscribe("problems", this.getProblemId())
    })
})

Template.resolvedModal.events({
    'submit'(event){
        event.preventDefault();
        
        var resolutionSummary = event.target.resolutionSummary.value
        var problem = Problems.findOne({ _id : Template.instance().getProblemId()})

        if (resolutionSummary === undefined || resolutionSummary === '') {
            notify('You cannot submit an empty input', 'error')
            return true
        }

        markAsResolved.call({ 
            problemId: problem._id, 
            claimerId: problem.claimedBy,
            resolutionSummary: resolutionSummary
        }, (err, resp) => {
            if(err) { 
                notify(err.message, 'error') 
                return true
            }

            event.target.resolutionSummary.value = ''

            $('#markAsSolvedModal').modal('hide')
            notify('Successfully marked as resolved', 'success')

        })

        event.preventDefault();
    }
})