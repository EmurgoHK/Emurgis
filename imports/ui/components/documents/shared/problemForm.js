import { Template } from "meteor/templating"
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
        summary: new RegExp(Template.instance().filter.get(), 'ig')
      }, {
        description: new RegExp(Template.instance().filter.get(), 'ig')
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
    }
})
