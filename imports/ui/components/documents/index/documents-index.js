import { Template } from "meteor/templating"
import { FlowRouter } from "meteor/kadira:flow-router"


import { Problems } from "/imports/api/documents/both/problemCollection.js"
import { Comments } from '/imports/api/documents/both/commentsCollection'
import { addTag, defaultTagAddedFlag } from '/imports/api/user/both/userMethods'


import "./documents-index.html"
import "./documents-index-item/documents-index-item.js"
import "./documents-dobModal.js"

Template.documentsIndex.onCreated(function() {

    //Reactive Vars
    this.projectStatusTypes = new ReactiveVar(["in progress", "ready for review",'open', 'stale', 'my', 'isProblemWithEmurgis'])
    this.filter = new ReactiveVar({})
    this.searchFilter = new ReactiveVar(FlowRouter.current().queryParams.query || '')

    this.autorun(() => {

        // open a modal if the user has a profile but does not have a date of birth set.
        if (Meteor.user() && (Meteor.user().profile && !Meteor.user().profile.dob)) {
          $('#dobModal').modal('show')
        }

        // set default username tag, if the user has a profile, but default username tag isn't set yet
        if (Meteor.user() && (Meteor.user().profile && !Meteor.user().profile.defaultTagAdded)) {
            var names = Meteor.user().profile.name.trim().split(/\s+/g)
            // if there are white spaces, then probably not an email. no further processing needed
            if (names.length === 1) {
                // otherwise try to extract firstname from email
                var tempNames = names.slice()[0].split(".")
                if (tempNames[0].length >= 3) {
                    names = tempNames[0]
                }
                names = names.split("@")
            }
            // set first name as default username tag
            addTag.call({
                userId: Meteor.userId(),
                tag: names[0].trim()
            }, (err, res) => {
                if (err) {
                  console.log(err)
                } else {
                    // set defaultTagAdded flag to true
                    defaultTagAddedFlag.call({
                        defaultTagAdded: true
                    }, (err, res) => {
                        if (err) {
                          console.log(err)
                        }
                    })
                }
            })
        }

        SubsCache.subscribe('problems')
        SubsCache.subscribe('comments')

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
  'click .mobileProblemCard': function(event) {
    event.preventDefault();
    let problemId = event.target.id;
    FlowRouter.go('/'+problemId);
  },
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
