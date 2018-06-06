import { Template } from "meteor/templating"
import { FlowRouter } from "meteor/kadira:flow-router"
import { Problems } from "/imports/api/documents/both/problemCollection.js"


import { addProblem } from "/imports/api/documents/both/problemMethods.js"

import "./document-new.html"
import "./document-new-hooks.js"
import "/imports/ui/components/documents/shared/problemForm.html"

var formData = (eventTarget) => {
  var data = {}

  if (eventTarget.summary && eventTarget.summary.value !== '') {
    data.summary = eventTarget.summary.value;
  }

  if (eventTarget.description && eventTarget.description.value !== '') {
    data.description = eventTarget.description.value;
  }

  if (eventTarget.solution && eventTarget.solution.value !== '') {
    data.solution = eventTarget.solution.value;
  }
  
  return data;
}

Template.documentNew.onCreated(function() {
  this.autorun(() => {
    this.subscribe("problems")
  })
})

Template.documentNew.onRendered(function() {})

Template.documentNew.onDestroyed(function() {})

Template.documentNew.helpers({
  problem: () => {
    return {}
  }
})

Template.documentNew.events({
  'submit'(event){
    event.preventDefault();
    
    var data = formData(event.target)
    data.isProblemWithEmurgis = event.target.isProblemWithEmurgis.checked
    data.fyiProblem = event.target.fyiProblem.checked
    
    addProblem.call(data, (err, res) => {
      if (!err) { 
        FlowRouter.go('/' + res); 
        return;
      }
      var errResponse = JSON.parse(JSON.stringify(err))

      if(errResponse.details && errResponse.details.length >= 1) {
        console.log(errResponse.details);
        errResponse.details.forEach(e => {
          $('#' + e.name).addClass('is-invalid')
          $('#' + e.name + 'Error').show()
          $('#' + e.name + 'Error').text(e.message)
        });
      }
    }
  );
    event.preventDefault();
  }
})
