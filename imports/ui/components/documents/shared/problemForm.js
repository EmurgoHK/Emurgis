import { Template } from "meteor/templating"
import { FlowRouter } from "meteor/kadira:flow-router"
import { Problems } from "/imports/api/documents/both/problemCollection.js"

import { deleteDependency } from "/imports/api/documents/both/dependenciesMethods.js"

import "./problemForm.html"

const maxCharValue = (inputId) => {
    if(inputId === 'summary') { return (72 - 'problem: '.length) }
    return 1000
}

Template.problemForm.onCreated(function() {
  this.filter = new ReactiveVar('');
})

Template.problemForm.helpers({
  problems() {
    let query = {
      $or: [{
        summary: new RegExp(Template.instance().filter.get().replace(/ /g, '|').replace(/\|$/, ''), 'ig')
      }, {
        description: new RegExp(Template.instance().filter.get().replace(/ /g, '|').replace(/\|$/, ''), 'ig')
      }]
    }
    if (Template.instance().filter.get()) {
      return Problems.find(query);
    }
  }
})


Template.problemForm.events({
    'keyup .form-control' (event) {
        event.preventDefault()

        let inputId = event.target.id
        let inputValue = event.target.value
        let inputMaxChars = maxCharValue(inputId) - parseInt(inputValue.length)
        let charsLeftText = inputMaxChars + ' characters left'

        $('#' + inputId + '-chars').text(charsLeftText)

        let specialCodes = [8, 46, 37, 39] // backspace, delete, left, right

        if (inputMaxChars <= 0) {
          $('#' + inputId).keypress((e) => { return !!~specialCodes.indexOf(e.keyCode) })
          return true
        }

        $('#' + inputId).unbind('keypress')
    },
    'keyup #dependency' (event) {
        Template.instance().filter.set(event.target.value)
    },
    'click #isProblemWithEmurgis' (event) {
      let currentRoute = FlowRouter.current().route.name

      if (currentRoute === 'documentNew') {
        if (event.target.checked) {
          $('.problem-form-title').text('You are reporting a problem with the Emurgis platform itself')
          $('.document-new').find('.card').addClass('bg-info')
        } else {
          $('.problem-form-title').text('Add a new problem')
          $('.document-new').find('.card').removeClass('bg-info')
        }
      }

      
      console.log('clicked >>>', FlowRouter.current().route.name)
    }

})
