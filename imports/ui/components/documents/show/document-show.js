import { Template } from "meteor/templating"
import { FlowRouter } from "meteor/kadira:flow-router"
import { notify } from "/imports/modules/notifier"
import swal from 'sweetalert'

import { Problems } from "/imports/api/documents/both/problemCollection.js"
import { markAsUnSolved, markAsResolved, updateStatus, claimProblem, unclaimProblem, deleteProblem, watchProblem, unwatchProblem, readFYIProblem, removeClaimer, removeProblemImage, forceUnclaim, problemApproval } from "/imports/api/documents/both/problemMethods.js"
import { Dependencies } from "/imports/api/documents/both/dependenciesCollection.js"
import { deleteDependency, addDependency } from '/imports/api/documents/both/dependenciesMethods'
import { Comments } from "/imports/api/documents/both/commentsCollection.js"
import { postComment } from "/imports/api/documents/both/commentsMethods.js"
import { sendNotification } from "/imports/api/notifications/both/notificationsMethods.js"

import { hideHelpModal } from '/imports/api/user/both/userMethods'

import { getImages } from '/imports/ui/components/uploader/imageUploader'
import '/imports/ui/components/uploader/imageUploader'

import "./document-show.html"
import "./document-comments.html"
import "./resolved-modal.html"
import "./resolved-modal.js"

import './reject-modal.html'
import './reject-modal'

import './reject-solution-modal.html'
import './reject-solution-modal.js'
import './rejected-solutions.html'
import './rejected-solutions.js'

import './blockElement'

Template.documentShow.onCreated(function() {
  this.getDocumentId = () => FlowRouter.getParam("documentId")

  this.autorun(() => {
    SubsCache.subscribe('users')
    SubsCache.subscribe("problems", this.getDocumentId())
    SubsCache.subscribe("comments", this.getDocumentId())
    SubsCache.subscribe('dependencies')
  })

  this.commentInvalidMessage = new ReactiveVar('')

  this.filter = new ReactiveVar('')
  this.invFilter = new ReactiveVar('')
  this.userTag = new ReactiveVar('')
  this.notifiyMentions = new ReactiveVar([]);
})

Template.documentShow.onRendered(function() {})

Template.documentShow.onDestroyed(function() {})

Template.documentShow.helpers({
    problems: (inverse) => {
        if (Template.instance()[inverse ? 'invFilter' : 'filter'].get()) {
            let dep = Dependencies.find({
                dependencyId: Template.instance().getDocumentId()
            }).fetch()

            let invDep = Dependencies.find({
                problemId: Template.instance().getDocumentId()
            }).fetch()

            return Problems.find({
                _id: {
                    $nin: _.union(invDep.map(i => i.dependencyId), dep.map(i => i.problemId), [Template.instance().getDocumentId()]) // dont show already added problems
                },
                $or: [{
                    summary: new RegExp(Template.instance()[inverse ? 'invFilter' : 'filter'].get().replace(/ /g, '|').replace(/\|$/, ''), 'ig')
                }, {
                    description: new RegExp(Template.instance()[inverse ? 'invFilter' : 'filter'].get().replace(/ /g, '|').replace(/\|$/, ''), 'ig')
                }]
            }).fetch()
        }
    },
    blocking: () => {
        let deps = Dependencies.find({
            dependencyId: Template.instance().getDocumentId()
        }).fetch()

        let tmpDeps = deps.map(i => _.extend(i, {
            indent: 0
        }))

        let depth = 0

        while (tmpDeps.length && depth++ < 25) { // if there happen to be cycles in the dependency tree from old code, limit the depth to prevent stack overflow
            tmpDeps.forEach(i => {
                i.parents = Dependencies.find({
                    dependencyId: i.problemId
                }).fetch().map(j => _.extend(j, {
                    indent: i.indent + 20
                }))
            })

            tmpDeps = _.flatten(tmpDeps.map(i => i.parents))
        }

        return deps
    },
    rejected: () => {
        let problem = Problems.findOne({
            _id: Template.instance().getDocumentId()
        }) || {}

        return problem.status === 'rejected'
    },
    rejectedBy: () => {
        let problem = Problems.findOne({
            _id: Template.instance().getDocumentId()
        }) || {}

        return ((Meteor.users.findOne({
            _id: problem.rejectedBy
        }) || {}).profile || {}).name
    },
    fyi: () => {
        let problem = Problems.findOne({
            _id: Template.instance().getDocumentId()
        }) || {}

        problem.read = problem.read || []

        return {
            firstFive: Meteor.users.find({
                _id: {
                    $in: problem.read
                }
            }, {
                limit: 5,
                sort: {
                    'profile.name': -1
                }
            }).fetch().map(i => `<a href="#">${i.profile.name}</a>`).toString().replace(/,/ig, ', '),
            more: {
                count: problem.read.length > 5 ? problem.read.length - 5 : 0,
                usernames: Meteor.users.find({
                    _id: {
                        $in: problem.read
                    }
                }, {
                    skip: 5,
                    sort: {
                        'profile.name': -1
                    }
                }).fetch().map(i => i.profile.name).toString().replace(/,/ig, ', ')
            }
        }
    },
    alreadyApproved: () => {
        let problem = Problems.findOne({
            _id: Template.instance().getDocumentId()
        }) || {}

        return ~(problem.approvals || []).indexOf(Meteor.userId())
    },
    approval: () => {
        let problem = Problems.findOne({
            _id: Template.instance().getDocumentId()
        }) || {}

        problem.approvals = problem.approvals || []

        return {
            firstFive: Meteor.users.find({
                _id: {
                    $in: problem.approvals
                }
            }, {
                limit: 5,
                sort: {
                    'profile.name': -1
                }
            }).fetch().map(i => `<a href="#">${i.profile.name}</a>`).toString().replace(/,/ig, ', '),
            more: {
                count: problem.approvals.length > 5 ? problem.approvals.length - 5 : 0,
                usernames: Meteor.users.find({
                    _id: {
                        $in: problem.approvals
                    }
                }, {
                    skip: 5,
                    sort: {
                        'profile.name': -1
                    }
                }).fetch().map(i => i.profile.name).toString().replace(/,/ig, ', ')
            }
        }
    },
    problem() {
        return Problems.findOne({ _id: Template.instance().getDocumentId() }) || {}
    },
    dependencies() {
      return Dependencies.find({ problemId: Template.instance().getDocumentId() }) || []
    },
    comments() {
        return Comments.find({ problemId: Template.instance().getDocumentId() }) || {}
    },
    claimButton(problem) {
      if (problem.fyiProblem) {
        if (!~(problem.read || []).indexOf(Meteor.userId())) {
            return '<a class="btn btn-sm btn-primary readProblem" href="#" role="button">Got it</a>'
        } else {
            return '<a class="btn btn-sm btn-primary disabled" href="#" role="button">Understood</a>'
        }
      } else {
          if (problem.status !== 'closed') {
            if (problem.claimed && problem.claimedBy === Meteor.userId()) {
                return '<a class="btn btn-sm btn-primary unclaimProblem" href="#" role="button">Unclaim</a>'
            } else if (problem.claimed) {
                return '<a class="btn btn-sm btn-success disabled" href="#" role="button">Claimed</a>'
            } else {
                return '<a class="btn btn-sm btn-success claimProblem" href="#" role="button">Claim</a>'
            }
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
            return '<button data-toggle="modal" data-target="#markAsSolvedModal" class="btn btn-sm btn-success" role="button"> I have solved this problem </button>'
        }
    },
    unsolve(problem) {
        if (problem.status == 'ready for review' && problem.status !== 'closed') {
            return '<button id="unSolveProblem" class="btn btn-sm btn-warning" role="button"> Unsolve </button>'
        }
    },
    statusButton(problem) {
        if (problem.status === 'closed') {
          return '<a id="openProblem" class="btn btn-sm btn-success toggleProblem" role="button" href> Open </a>'
        }
    },
    resolvedByUser(problem) {
        let user = Meteor.users.findOne({ _id : problem.resolvedBy })
        return user.profile.name
    },
    commentInvalidMessage() {
        return Template.instance().commentInvalidMessage.get()
    },
    isSolutionAccepted(problem) {
        if (problem.hasAcceptedSolution) {
            return `<i class="nav-icon icon-check text-success"></i>`
        }

        return `<i class="nav-icon icon-info text-warning"></i>`
    },
    acceptSolution(problem) {
        if (problem.createdBy === Meteor.userId() && problem.status === 'ready for review') {
            return `
                <hr>
                <a id="closeProblem" class="btn btn-sm btn-success toggleProblem" role="button" href> accept this solution</a>
                <a id="rejectSolution" data-toggle="modal" data-target="#rejectSolutionModal" class="btn btn-sm btn-danger" role="button" href> reject this solution</a>
            `
        }
    },
    isOwner: problem => {
        return problem.createdBy === Meteor.userId()
    },
    canDeleteDep: problem => {
        let user = Meteor.users.findOne({
            _id: Meteor.userId()
        }) || {}

        return problem.createdBy === Meteor.userId() || user.moderator
    },
    userTags() {
      if (Template.instance().userTag.get() != '') {
        return Meteor.users.find({ _id: { $ne: Meteor.userId() }, 'profile.tags': new RegExp(Template.instance().userTag.get(), 'ig') });
      }

      return [];
    }
})

Template.documentShow.events({
    'keyup #dependency' (event) {
        Template.instance().filter.set(event.target.value)
    },

    'keyup #invDependency' (event) {
        Template.instance().invFilter.set(event.target.value)
    },

    'keyup #comments' (event) {
        const text = event.target.value;
        const textArray = text.split(' ');
        if (textArray[textArray.length -1] != "" && textArray[textArray.length -1] != " ") {
          if (textArray[textArray.length -1].includes('@')) {
            Template.instance().userTag.set(textArray[textArray.length -1].substring(1));
          } else {
            Template.instance().userTag.set(textArray[textArray.length -1]);
          }
        }
    },

    'click .usertags' (event) {
        let comment = $('#comments').val();
        if (comment.lastIndexOf(' ') == -1) {
          $('#comments').val(event.target.innerHTML)
        } else {
          $('#comments').val(comment.substring(0, comment.lastIndexOf(' ') + 1) + event.target.innerHTML)
        }

        Template.instance().notifiyMentions.get().push(event.target.id)
        Template.instance().userTag.set('');
    },

    'click .dependency' (event) {
        event.preventDefault()

        addDependency.call({
            pId: Template.instance().getDocumentId(),
            dId: event.target.id
        }, (err, res) => {
            if (!err) {
                $('#dependency').val('')
                $('#dependency').trigger('keyup')

                window.scroll({ top: 0 })
            } else {
                notify(err.reason || err.message, 'error')
            }
        })
    },
    'click .invDependency': (event, templateInstance) => {
        event.preventDefault()

        addDependency.call({
            pId: event.target.id,
            dId: Template.instance().getDocumentId()
        }, (err, res) => {
            if (!err) {
                $('#invDependency').val('')
                $('#invDependency').trigger('keyup')

                window.scroll({ top: 0 })
            } else {
                notify(err.reason || err.message, 'error')
            }
        })
    },
  'click .remove-problem-image': (event, templateInstance) => {
    event.preventDefault()

    removeProblemImage.call({
      _id: $(event.currentTarget).data('id'),
      image: $(event.currentTarget).data('image')
    }, (err, data) => {
      if (err) {
        console.log(err)
      }
    })
  },
    'click .forceUnclaim': function (event, templateInstance) {
        event.preventDefault()

        swal({
            text: `Are you sure you want to forcefully remove the current claimer?`,
            icon: 'warning',
            buttons: true,
            dangerMode: true,
            showCancelButton: true
        }).then(confirmed => {
            if (confirmed) {
                forceUnclaim.call({
                    _id: templateInstance.getDocumentId()
                }, (err, data) => {
                    if (err) {
                        notify(err.reason || err.message, 'error')
                    }
                })
            }
        })
    },
  'click .remove-dep': function (event, templateInstance) {
    event.preventDefault()

    swal({
        text: `Are you sure you want to remove this dependency?`,
        icon: "warning",
        buttons: true,
        dangerMode: true,
        showCancelButton: true
    }).then(confirmed => {
        if (confirmed) {
            deleteDependency.call({
                id: this._id
            }, (err, data) => {
                if (err) { console.log(err) }
            })
        }
    })
  },
    "click .toggleProblem" (event) {
        var status = event.target.id === 'closeProblem' ? 'closed' : 'open';
        let problem = Problems.findOne({ _id: Template.instance().getDocumentId() })
        let claimer = Meteor.users.findOne({
            _id: problem.claimedBy
        }) || {}
        let info = ''

        if (Meteor.userId()) {
            swal({
                    text: `Was this problem actually solved by ${(claimer.profile || {}).name}?`,
                    icon: "warning",
                    buttons: true,
                    dangerMode: true,
                    showCancelButton: true
                })
                .then(confirmed => {
                    if (status === 'closed' && claimer && confirmed) {
                        info = 'actually-solved'
                    }

                    updateStatus.call({
                        problemId: problem._id,
                        status: status,
                        info: info
                    }, (error, response) => {
                        if (error) { console.log(error) }
                    })
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
    "click #unSolveProblem" (event) {
        let problem = Problems.findOne({ _id : Template.instance().getDocumentId() })

        if (Meteor.userId()) {
            markAsUnSolved.call({
                problemId: problem._id,
                claimerId: problem.claimedBy
            }, (error, response) => {
                if(error) { console.log(error.details) }
            })
        }
    },
    'click .problemApproval': (event, templateInstance) => {
        event.preventDefault()

        if (Meteor.userId()) {
            let problem = Problems.findOne({
                _id: Template.instance().getDocumentId()
            }) || {}

            if (!~(Meteor.users.findOne({ _id: Meteor.userId() }).hidden || []).indexOf('+1modal')) {
                let username = ((Meteor.users.findOne({
                    _id: problem.createdBy
                }) || {}).profile || {}).name

                swal({
                    text: `This is to let you show ${username} that you agree this is a problem worth solving.`,
                    showCancelButton: true,
                    buttons: true
                }).then(value => {
                    if (value) {
                        hideHelpModal.call({
                            helpModalId: '+1modal'
                        }, (err, data) => {
                            if (err) {
                                console.log(err)
                            }
                        })

                        problemApproval.call({
                            _id: templateInstance.getDocumentId()
                        }, (error, response) => {
                            if (error) { 
                                notify(error.details, 'error')
                            }
                        })
                    }
                })
            } else {
                problemApproval.call({
                    _id: templateInstance.getDocumentId()
                }, (error, response) => {
                    if (error) { 
                        notify(error.details, 'error')
                    }
                })
            }
        }
    },
    'click .readProblem': (event, templateInstance) => {
        if (Meteor.userId()) {
            readFYIProblem.call({
                _id: templateInstance.getDocumentId()
            }, (error, response) => {
                if(error) { notify(error.details, 'error') }
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
                let mentions = Array.from(new Set(Template.instance().notifiyMentions.get()).values());
                var commentValue = $('#comments').val();

                if (commentValue.length == 0) {
                    Template.instance().commentInvalidMessage.set("Please type something before posting")
                } else if (commentValue.length <= 3) {
                    Template.instance().commentInvalidMessage.set("The comment is too small")
                } else if (commentValue.length > 500) {
                    Template.instance().commentInvalidMessage.set("The comment is too long")
                } else {
                    Template.instance().commentInvalidMessage.set("")
                    Template.instance().notifiyMentions.set([]);

                    postComment.call({
                        problemId: problemId,
                        comment: commentValue,
                        mentions: mentions,
                        images: getImages(true)
                    }, function(error, result) {
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
                }
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
                buttons: true,
                dangerMode: true,
                showCancelButton: true
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
                 icon: "warning",
                 buttons: true,
                 dangerMode: true,
                 showCancelButton: true
             })
             .then(confirmed => {
                     if (confirmed) {

                        if (Meteor.userId()) {
                            instance.inEstimate = true
                            swal({
                                text: 'How many minutes do you think you need to spend working on this problem?',
                                content: {
                                    element: "input",
                                    attributes: {
                                        placeholder: "Enter the estimated workload (in minutes)",
                                        type: "number",
                                    }
                                },
                                button: {
                                    text: "Estimate",
                                    closeModal: true,
                                },
                            }).then(estimate => {
                                instance.inEstimate = false
                                if (!estimate) {
                                    notify('Invalid time estimate provided.', 'error')

                                    return
                                }

                                 claimProblem.call({
                                     _id: problemId,
                                     estimate: Number(estimate)
                                 }, (error, result) => {
                                    if (error) {
                                        if (error.details) {
                                            notify(error.details, 'error')
                                        } else {
                                            notify(error.message || error.reason, 'error')
                                        }
                                    } else {
                                        notify('Problem claimed successfully.', 'success');
                                    }
                                })
                             })

                            $('.swal-content__input').on('keyup', (event) => { // meteor events won't pickup this element as it's dynamically created, so we have to use jquery events
                                if (instance.inEstimate) {
                                    let text = 'How many minutes do you think you need to spend working on this problem?'
                                    if (Number($(event.currentTarget).val()) > 0) {
                                        let user = Meteor.users.findOne({
                                            _id: Meteor.userId()
                                        })

                                        if (user && user.profile) {
                                            let age = (new Date().getTime() - user.profile.dob) / 31556926000

                                            let usableTime = (65 - age) * 48 * 5 * 6 * 60 * 0.7

                                            if (usableTime < 0) { // in an off case that somebody is older than 65 :)
                                                usableTime = 0
                                            }

                                            $('.swal-text').html(`${text}<br><br>${user.profile.name}, you have approximately ${Math.round(usableTime / 60)} productive hours remaining in your life. This means you can only solve ${Math.round(usableTime / Number($(event.currentTarget).val()))} problems like this. Every minute counts.`)
                                        } else {
                                            $('.swal-text').html(text)
                                        }
                                    } else {
                                        $('.swal-text').html(text)
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
                    buttons: true,
                    dangerMode: true,
                    showCancelButton: true
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
    },

    "click #removeClaimer" (event) {
        event.preventDefault()

        if (Meteor.userId()) {
            let problemId = Template.instance().getDocumentId()

            swal({
                text: "Are you sure you want to remove claimer from this problem?",
                icon: "warning",
                buttons: true,
                dangerMode: true,
                showCancelButton: true
            }).then((confirmed) => {
                if (confirmed) {
                    removeClaimer.call({ problemId: problemId }, (err, response) => {
                        if (err) { notify(err.message, 'error'); }
                    })
                }
            })
        }
    }

})
