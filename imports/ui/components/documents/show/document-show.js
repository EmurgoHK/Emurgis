import { Template } from "meteor/templating"
import { FlowRouter } from "meteor/kadira:flow-router"
import { notify } from "/imports/modules/notifier"
import swal from 'sweetalert'

import { Problems } from "/imports/api/documents/both/problemCollection.js"
import { markAsResolved, updateStatus, claimProblem, unclaimProblem, deleteProblem, watchProblem, unwatchProblem } from "/imports/api/documents/both/problemMethods.js"

import { Comments } from "/imports/api/documents/both/commentsCollection.js"
import { postComment } from "/imports/api/documents/both/commentsMethods.js"


import "./document-show.html"
import "./document-comments.html"

Template.documentShow.onCreated(function() {
  this.getDocumentId = () => FlowRouter.getParam("documentId")

  this.autorun(() => {
    this.subscribe("problems", this.getDocumentId())
    this.subscribe("comments", this.getDocumentId())
    this.subscribe('users')
  })
})

Template.documentShow.onRendered(function() {})

Template.documentShow.onDestroyed(function() {})

Template.documentShow.helpers({
    problem() {
        return Problems.findOne({ _id: Template.instance().getDocumentId() }) || {}
    },
    comments() {
        return Comments.find({ problemId: Template.instance().getDocumentId() }) || {}
    },
    claimButton(problem) {
      if (problem.status !== 'closed') {
        if (problem.claimed && problem.claimedBy === Meteor.userId()) {
            return '<a class="btn btn-sm btn-primary unclaimProblem" href="#" role="button">Unclaim</a>'
        } else if (problem.claimed) {
            return '<a class="btn btn-sm btn-success disabled" href="#" role="button">Claimed</a>'
        } else {
            return '<a class="btn btn-sm btn-success claimProblem" href="#" role="button">Claim</a>'
        }
      }
    },
    watchButton(problem) {
      if (~(problem.subscribers || []).indexOf(Meteor.userId())) {
        return '<a class="btn btn-sm btn-primary unwatchProblem" href="#" role="button">Unwatch</a>'
      } else {
        return '<a class="btn btn-sm btn-primary watchProblem" href="#" role="button">Watch</a>'
      }
    },
    markAsResolved(problem) {
        if (problem.status !== 'ready for review' && problem.status !== 'closed') {
            return '<a id="resolveProblem" class="btn btn-sm btn-primary" role="button" href> I have solved this problem </a>'
        }
    },
    statusButton(problem) {
        if (problem.status === 'closed') {
          return '<a id="openProblem" class="btn btn-sm btn-success toggleProblem" role="button" href> Open </a>'
        } else {
          return '<a id="closeProblem" class="btn btn-sm btn-danger toggleProblem" role="button" href> This is fixed/solved </a>'
        }
    },
    resolvedByUser(problem) {
        let user = Meteor.users.findOne({ _id : problem.resolvedBy })
        return user.profile.name
    }
})

Template.documentShow.events({
    "click .toggleProblem" (event) {
        var status = event.target.id === 'closeProblem' ? 'closed' : 'open';
        let problem = Problems.findOne({ _id: Template.instance().getDocumentId() })
        let claimer = Meteor.users.findOne({
            _id: problem.claimedBy
        })
        let info = ''

        if (Meteor.userId()) {
            swal({
                    text: `Was this problem actually solved by ${(claimer.profile || {}).name}?`,
                    icon: "warning",
                    dangerMode: true,
                })
                .then(confirmed => {
                    if (status === 'closed' && claimer && confirmed) {

                        info = 'actually-solved'

                        updateStatus.call({
                            problemId: problem._id,
                            status: status,
                            info: info
                        }, (error, response) => {
                            if (error) { console.log(error) }
                        })
                    }
                });


        }
    },
    "click #resolveProblem" (event) {
        let problem = Problems.findOne({ _id : Template.instance().getDocumentId() })

        if (Meteor.userId()) {
            markAsResolved.call({
                problemId: problem._id,
                claimerId: problem.claimedBy
            }, (error, response) => {
                if(error) { console.log(error.details) }
            })
        }
    },
    "click .unwatchProblem" (event, instance) {
        event.preventDefault()

        if (Meteor.userId()) {
            unwatchProblem.call({
                _id: Template.instance().getDocumentId(),
            }, (error, result) => {
                if (error) {
                    if (error.details) {
                        console.error(error.details)
                   } else {
                        console.error(error)
                    }
                }
            })
        } else {
            notify('Must be logged in!', 'error')
        }
    },
    "click .watchProblem" (event, instance) {
        event.preventDefault()

        if (Meteor.userId()) {
            watchProblem.call({
                _id: Template.instance().getDocumentId(),
            }, (error, result) => {
                if (error) {
                    if (error.details) {
                        console.error(error.details)
                   } else {
                        console.error(error)
                    }
                }
            })
        } else {
            notify('Must be logged in!', 'error')
        }
    },
    "click .documentCommentBtn" (event, instance) {
        event.preventDefault()

        if (Meteor.userId()){
                let problemId = Template.instance().getDocumentId()
                var commentValue = $('#comments').val();

                postComment.call({
                    problemId: problemId,
                    comment: commentValue
                }, (error, result) => {
                    if (error) {
                        if (error.details) {
                            console.error(error.details)
                        } else {
                            console.error(error)
                        }
                    }else{
                    	$('#comments').val("");
                    }
                })

            } else {
                notify("Must be logged in!", "error")
            }
    },

    "click .js-delete-document" (event, instance) {
        event.preventDefault()
        let problemId = Template.instance().getDocumentId()

        swal({
                text: "Are you sure you want to delete this problem?",
                icon: "warning",
                dangerMode: true,
            })
            .then(confirmed => {
                if (confirmed) {
                    
                    if (Meteor.userId()) {

                        deleteProblem.call({ id: problemId }, (error, result) => {
                            if (error) {
                                if (error.details) {
                                    console.error(error.details)
                                }
                            } else {
                                FlowRouter.go('/');
                            }
                        })
                    }
                }
            });
    },

    "click .claimProblem" (event, instance) {
        event.preventDefault()

        if (Meteor.userId()) {
            let problemId = Template.instance().getDocumentId()
            swal({
                    text: "Are you sure you want to claim this problem?",
                    icon: "success",
                    dangerMode: true,
                })
                .then(confirmed => {
                    if (confirmed) {

                        if (Meteor.userId()) {

                            claimProblem.call({
                                _id: problemId
                            }, (error, result) => {
                                if (error) {
                                    if (error.details) {
                                        console.error(error.details)
                                    } else {
                                        notify('Problem claimed successfully', 'success');
                                    }
                                }
                            })
                        }
                    }
                });
        } else {
            notify("Must be logged in!", "error")
        }
    },

    "click .unclaimProblem" (event, instance) {
        event.preventDefault()

        if (Meteor.userId()) {
            let problemId = Template.instance().getDocumentId()
            swal({
                    text: "Are you sure you want to unclaim this problem?",
                    icon: "warning",
                    dangerMode: true,
                })
                .then(confirmed => {
                    if (confirmed) {

                        if (Meteor.userId()) {

                            unclaimProblem.call({
                                _id: problemId
                            }, (error, result) => {
                                if (error) {
                                    if (error.details) {
                                        console.error(error.details)
                                    } else {
                                        notify('Problem unclaimed successfully', 'success');
                                    }
                                }
                            })
                        }
                    }
                });
        } else {
            notify("Must be logged in!", "error")
        }
    }

})
