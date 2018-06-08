import { Template } from "meteor/templating"
import { FlowRouter } from "meteor/kadira:flow-router"
import { Problems } from "/imports/api/documents/both/problemCollection.js"

import { deleteDependency } from "/imports/api/documents/both/dependenciesMethods.js"
import { hideHelpModal } from '/imports/api/user/both/userMethods'

import "./problemForm.html"

const helperTexts = {
    description: 'Carefully write the issue by describing the problem you face or observe. You SHOULD seek consensus from others on the accuracy of your observation to ensure that what you think is a problem really is actually a problem. You should also seek consensus on the value of solving the problem.\n\nAny non-problems will be deleted and added to your non-problem statistics.',
    solution: 'What is the simplest possible solution? You SHOULD NOT log any ideas, suggestions, or any solutions to problems that are not explicitly documented above.',
    summary: 'Briefly describe the issue so that others can quickly understand what it is. If you cannot add "Problem:" to the front of your statement and have it still make perfect sense then it isn\'t a problem statement and will be deleted.'
}

const maxCharValue = (inputId) => {
    if(inputId === 'summary') { return (72 - 'problem: '.length) }
    return 1000
}

Template.problemForm.onCreated(function() {
  this.filter = new ReactiveVar('');

  this.shown = new ReactiveDict()
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

const showModal = (id, templateInstance) => {
    swal({
        text: helperTexts[id],
        buttons: {
            hide: {
                text: 'Hide permanently',
                value: 'hide',
            },
            ok: true
        }
    }).then(value => {
        if (value === 'hide') {
            hideHelpModal.call({
                helpModalId: id
            }, (err, data) => {
                if (err) {
                    console.log(err)
                }
            })
        }

        templateInstance.shown.set(id, true)
    })
}

Template.problemForm.events({
    'click .fa-question-circle': (event, templateInstance) => {
        event.preventDefault()

        showModal($(event.currentTarget).data('id'), templateInstance)
    },
    'keyup .form-control': (event, templateInstance) => {
        event.preventDefault()

        if (FlowRouter.current().route.name === 'documentNew' && !~(Meteor.users.findOne({ _id: Meteor.userId() }).hidden || []).indexOf(event.target.id) && !templateInstance.shown.get(event.target.id)) {
            showModal(event.target.id, templateInstance)
        }

        let inputId = event.target.id
        let inputValue = event.target.value
        let inputMaxChars = maxCharValue(inputId) - parseInt(inputValue.length)
        let charsLeftText = inputMaxChars + ' characters left'

        $(`a[data-id$="${inputId}"]`).show()

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
