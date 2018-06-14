import { Template } from "meteor/templating"
import { FlowRouter } from "meteor/kadira:flow-router"


import { Problems } from "/imports/api/documents/both/problemCollection.js"
import { Comments } from '/imports/api/documents/both/commentsCollection'


import "./documents-index.html"
import "./documents-index-item/documents-index-item.js"

Template.documentsIndex.onCreated(function() {

    //Reactive Vars
    this.projectStatusTypes = new ReactiveVar(["in progress", "ready for review",'open', 'my', 'isProblemWithEmurgis'])
    this.filter = new ReactiveVar({})
    this.searchFilter = new ReactiveVar('');

    this.autorun(() => {
        this.subscribe('problems')
        this.subscribe('comments')

        //reactive variable to query mongoDB based on the status type
        let projectStatusTypes = Template.instance().projectStatusTypes.get();

        let query = {
            status: { $in: projectStatusTypes }
        }

        if (!~projectStatusTypes.indexOf('my')) {
          query = _.extend(query, {
            createdBy: {
              $ne: Meteor.userId()
            }
          })
        }

        if (!~projectStatusTypes.indexOf('isProblemWithEmurgis')) {
          query.isProblemWithEmurgis = {
            $ne: true
          }
        }

        this.filter.set(query)
    });
});

Template.documentsIndex.onRendered(function() {})

Template.documentsIndex.onDestroyed(function() {})

Template.documentsIndex.helpers({
  problems() {
    let filter = Template.instance().filter.get()

    return Problems.find(filter, { sort: { createdAt: -1 } }).fetch().filter(i => {
      let comments = Comments.find({
        problemId: i._id
      }).fetch()

      let regex = new RegExp(Template.instance().searchFilter.get().replace(/ /g, '|').replace(/\|$/, ''), 'i')

      return regex.test(i.summary) || regex.test(i.solution) || regex.test(i.description) || comments.some(j => regex.test(j.comment))
    })
  }
})

Template.documentsIndex.events({
  'click #new-problem': function(event) {
    event.preventDefault();

    // make the check global later for checking if user is logged in
    if (Meteor.userId()) {
      FlowRouter.go('/new');
    } else {
      FlowRouter.go('/signin');
    }
  },
  'click .projectFiltersPanel': function (event, template) {

    // build array from the checkboxes selected
    var projectStatusTypes = template.$('.projectFiltersPanel input:checked').map(function () {
      return $(this).val();
    });
    var whatIsChecked = $.makeArray(projectStatusTypes);
    console.log(whatIsChecked)
    template.projectStatusTypes.set(whatIsChecked);
  }
})
