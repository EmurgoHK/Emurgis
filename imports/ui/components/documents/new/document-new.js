import { Template } from "meteor/templating"
import { FlowRouter } from "meteor/kadira:flow-router"
import { Problems } from "/imports/api/documents/both/problemCollection.js"


import { addProblem } from "/imports/api/documents/both/problemMethods.js"
import { getImages } from '/imports/ui/components/uploader/imageUploader'

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

  if (Template.instance().dependency.get() != []) {
    var dependencies =[]
    Template.instance().dependency.get().forEach( dep => {
      dependencies.push(dep.dependencyId);
    })
    data.dependencies = dependencies;
  }

  if (Template.instance().invDependency.get() != []) {
    var invDependencies = []
    Template.instance().invDependency.get().forEach( dep => {
      invDependencies.push(dep.problemId)
    })
    data.invDependencies = invDependencies
  }

  return data;
}

Template.documentNew.onCreated(function() {
  this.dependency = new ReactiveVar([])
  this.invDependency = new ReactiveVar([])

  this.autorun(() => {
    this.subscribe("problems")
  })
})

Template.documentNew.onRendered(function() {})

Template.documentNew.onDestroyed(function() {})

Template.documentNew.helpers({
  problem: () => {
    return {}
  },
  dependencies: () => {
    return Template.instance().dependency.get();
  },
  invDependencies: () => Template.instance().invDependency.get()
})

Template.documentNew.events({
  'submit'(event){
    event.preventDefault();

    var data = formData(event.target)
    data.isProblemWithEmurgis = event.target.isProblemWithEmurgis.checked
    data.fyiProblem = event.target.fyiProblem.checked
    data.images = getImages()

    addProblem.call(data, (err, res) => {
      if (!err) {
        FlowRouter.go('/' + res);
        return;
      }
      console.log(err);
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
  },
  'click .remove-dep': function (event, templateInstance) {
    event.preventDefault()

    let dep = Template.instance().dependency.get()

    Template.instance().dependency.set(dep.filter(i => this.dependencyId !== i.dependencyId))
  },
  'click .remove-dep-inv': function (event, templateInstance) {
    event.preventDefault()

    let dep = Template.instance().invDependency.get()

    Template.instance().invDependency.set(dep.filter(i => this.problemId !== i.problemId))
  },
  'click .dependency' (event) {
    var dependency = Template.instance().dependency.get();
    dependency.push({dependency: event.target.innerHTML, dependencyId: event.target.id})
    Template.instance().dependency.set(dependency)
    $('#dependency').val('');
    $('#dependency').trigger('keyup');
  },
  'click .invDependency': (event, templateInstance) => {
    let invDependency = templateInstance.invDependency.get()

    invDependency.push({
      problem: event.target.innerHTML,
      problemId: event.target.id
    })

    templateInstance.invDependency.set(invDependency)

    $('#invDependency').val('')
    $('#invDependency').trigger('keyup')
  }
})
