import { Template } from "meteor/templating"
import { editProblem } from "/imports/api/documents/both/problemMethods.js"
import { addDependency, deleteDependency } from "/imports/api/documents/both/dependenciesMethods.js"
import { Problems } from "/imports/api/documents/both/problemCollection.js"
import { Dependencies } from "/imports/api/documents/both/dependenciesCollection.js"
import { notify } from "/imports/modules/notifier"

import "./document-edit.html"
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

	if (eventTarget.estimate && eventTarget.estimate.value !== '') {
    data.estimate = Number(eventTarget.estimate.value);
  	}


	return data;
}


Template.documentEdit.onCreated(function() {
	this.problemId = () => FlowRouter.getParam("documentId")

	this.autorun(() => {
		this.subscribe("problems", this.problemId())
		this.subscribe("dependencies", this.problemId())
    })
})
Template.documentEdit.onRendered(function() {})
Template.documentEdit.onDestroyed(function() {})

Template.documentEdit.helpers({
	problem() {
		return Problems.findOne({ _id: Template.instance().problemId() }) || {}
    },
	canEditProblem (problemOwner) {
		if (problemOwner !== Meteor.userId()) { FlowRouter.go('/') }
	},
	dependencies() {
    return Dependencies.find({ problemId: Template.instance().problemId() }) || [];
  }
})

Template.documentEdit.events({
	'submit'(event) {
		event.preventDefault();

		var data = formData(event.target)

		data.isProblemWithEmurgis = event.target.isProblemWithEmurgis.checked
		data.fyiProblem = event.target.fyiProblem.checked
		data.id = Template.instance().problemId()

    	editProblem.call(data, (err, res) => {
			if (!err) {
				FlowRouter.go('/' + res);
				return;
			}

			var errResponse = JSON.parse(JSON.stringify(err))

			if(errResponse.details && errResponse.details.length >= 1) {
				errResponse.details.forEach(e => {
					$('#' + e.name).addClass('is-invalid')
					$('#' + e.name + 'Error').show()
					$('#' + e.name + 'Error').text(e.message)
				});
			}
		})
	},
	'click .delete-button' (event) {
		event.preventDefault();
		deleteDependency.call({
			id: event.target.id
		}, (err, res) => {
			if (err) {
					console.error(err)
			}
		});
	},
	'click .dependency' (event) {
		//create a new dependency here
		event.preventDefault();
		addDependency.call({ pId: Template.instance().problemId(), dId: event.target.id }, (err, res) => {
			if(!err) {
				console.log("Created successfully");
			} else {
				$('#dependency').val('');
				$('#dependency').trigger('keyup');
				console.error(err);
			}
		})
	}
})
