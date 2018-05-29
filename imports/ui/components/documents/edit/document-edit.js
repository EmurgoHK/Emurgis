import { Template } from "meteor/templating"
import { editProblem } from "/imports/api/documents/both/problemMethods.js"
import { Problems } from "/imports/api/documents/both/problemCollection.js"
import { notify } from "/imports/modules/notifier"

import "./document-edit.html"

Template.documentEdit.onCreated(function() {
	this.problemId = () => FlowRouter.getParam("documentId")

	this.autorun(() => {
		this.subscribe("problems", this.problemId())
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
	}
})

Template.documentEdit.events({
	'submit'(event) {
		event.preventDefault();

		var data = {}
		data.id = Template.instance().problemId(),
		data.summary = event.target.problemSummary.value;
		data.solution = event.target.solution.value;
		data.description = event.target.problemDescription.value;

		editProblem.call(data, (err, res) => {
			if (err) { console.log(err); }
			notify('problem updated successfully', 'success');
		});
	}
})
