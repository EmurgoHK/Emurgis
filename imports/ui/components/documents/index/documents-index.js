import { Template } from "meteor/templating"
import { FlowRouter } from "meteor/kadira:flow-router"


import { Problems } from "/imports/api/documents/both/problemCollection.js"


import "./documents-index.html"
import "./documents-index-item/documents-index-item.js"

Template.documentsIndex.onCreated(function() {

    //Reactive Vars
    this.projectStatusTypes = new ReactiveVar(["in progress", "ready for review",'open', 'my'])
    this.filter = new ReactiveVar({})
    this.searchFilter = new ReactiveVar(undefined);

    this.autorun(() => {
        this.subscribe("problems");

        //reactive variable to query mongoDB based on the status type
        let projectStatusTypes = Template.instance().projectStatusTypes.get();
        let searchFilter = Template.instance().searchFilter.get();

        let query = {
            status: { $in: projectStatusTypes },
            '$or': [{
                summary: {
                    $regex: new RegExp(searchFilter, "i")
                }
            }, {
                solution: {
                    $regex: new RegExp(searchFilter, "i")
                }
            }, {
                description: {
                    $regex: new RegExp(searchFilter, "i")
                }
            }]
        }
        
        if (!~projectStatusTypes.indexOf('my')) {
          query = _.extend(query, {
            createdBy: {
              $ne: Meteor.userId()
            }
          })
        }

        if (~projectStatusTypes.indexOf('isProblemWithEmurgis')) {
          query['$or'].push({ isProblemWithEmurgis : true })
        }

        this.filter.set(query)


    });
});

Template.documentsIndex.onRendered(function() {})

Template.documentsIndex.onDestroyed(function() {})

Template.documentsIndex.helpers({
  problems() {
    let filter = Template.instance().filter.get();
    return Problems.find(filter, { sort: { createdAt: -1 } })
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
  },
  'keyup #searchFilter': function (event) {
    event.preventDefault();
    let query = $('#searchFilter').val();

    //clear filter if no value in search bar
    if (query.length < 1) {
      Template.instance().searchFilter.set(undefined);
    }

    if (query) {
      Template.instance().searchFilter.set(query); //done
    }

  }
})
