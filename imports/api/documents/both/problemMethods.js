import { Meteor } from "meteor/meteor"
import SimpleSchema from "simpl-schema"
import { ValidatedMethod } from "meteor/mdg:validated-method"
import { Problems } from "./problemCollection.js"

import { Stats } from '../../stats/both/statsCollection'

import { sendNotification } from '/imports/api/notifications/both/notificationsMethods'
import { isModerator } from '/imports/api/user/both/userMethods'
import { insertDependency } from './dependenciesMethods'

//we need to move this to a global file and manage once
const {
    Integer,
    RegEx,
    oneOf
} = SimpleSchema

const {
    Id,
    Domain
} = RegEx

export const staleStatus = (problem) => {
    if (problem && problem.status === 'stale') {
        return {
            status: problem.oldStatus
        }
    }

    return {}
}

export const updateLastAction = (problemId) => {
    Problems.update({
        _id: problemId
    }, {
        $set: _.extend({
            lastActionTime: new Date().getTime()
        }, staleStatus(Problems.findOne(problemId)))
    })
}

export const addToSubscribers = (problemId, userId) => {
    let problem = Problems.findOne({
        _id: problemId
    })

    Problems.update({
        _id: problemId
    }, {
        $set: _.extend({
            lastActionTime: new Date().getTime()
        }, staleStatus(problem)),
        $addToSet: {
          subscribers: userId
        }
    })
}

export const sendToSubscribers = (problemId, authorId, message, isCommentMention = false) => {
  let problem = Problems.findOne({
    _id: problemId
  })

  if (problem && problem.subscribers && problem.subscribers.length) {
    problem.subscribers.forEach(i => {
      if (i !== authorId) { // don't notify yourself
        sendNotification(i, message, 'System', `/${problem._id}`)
      }
    })
  }
  return problem.subscribers;
}

//Define a ValidatedMethod which can be called from both the client and server
//to validate data submitted on the problem form.
export const addProblem = new ValidatedMethod({
    name: 'addProblem',
    //Define the validation rules which will be applied on both the client and server
    validate:
        new SimpleSchema({
            summary: { type: String, max: 70, optional: false},
            description: { type: String, max: 1000, optional: true},
            solution: { type: String, max: 1000, optional: true},
            estimate: { type: Number, min:1, optional: true },
            isProblemWithEmurgis: { type: Boolean, optional: true },
            fyiProblem: { type: Boolean, optional: true },
            dependencies: {type: Array, minCount: 0, maxCount: 10, optional: true},
            "dependencies.$": {type: String, optional: true},
            invDependencies: {type: Array, minCount: 0, maxCount: 10, optional: true},
            'invDependencies.$': {type: String, optional: true},
            images: { type: Array, optional: true },
            'images.$': { type: String, optional: true }
            //url: {type: String, regEx:SimpleSchema.RegEx.Url, optional: false},
            //image: {label:'Your Image',type: String, optional: true, regEx: /\.(gif|jpg|jpeg|tiff|png)$/
        }).validator(),

    run({ summary, description, solution, isProblemWithEmurgis, fyiProblem, dependencies, invDependencies, images, estimate }) {

    	//Define the body of the ValidatedMethod, e.g. insert some data to a collection
		if (!Meteor.userId()) {
			throw new Meteor.Error('Error.', 'You have to be logged in.')
		}

    let pId = Problems.insert({
      'summary': summary,
      'description': description || "",
      'solution': solution || "",
      'createdAt': new Date().getTime(),
      'createdBy': Meteor.userId() || "",
      'status':'open',
      'isProblemWithEmurgis': isProblemWithEmurgis,
      fyiProblem: fyiProblem,
      subscribers: [Meteor.userId()],
      images: images,
      lastActionTime: new Date().getTime()
    })

    dependencies.forEach(i => insertDependency(pId, i))
    invDependencies.forEach(i => insertDependency(i, pId))

    Stats.upsert({
      userId: Meteor.userId()
    }, {
      $addToSet: {
        loggedProblems: pId
      }
    })

    if (fyiProblem) {
        let user = Meteor.users.findOne({
            _id: Meteor.userId()
        }) || {}

        Meteor.users.find({}).fetch().forEach(i => {
            if (i._id !== Meteor.userId()) { // don't notify the user that has added the problem
                sendNotification(i._id, `${(user.profile || {}).name} has added a new FYI. Check it out.`, 'System', `/${pId}`)
            }
        })
    }

		return pId
  }
});

//end

export const watchProblem = new ValidatedMethod({
  name: 'watchProblem',
  validate: new SimpleSchema({
    _id: { type: RegEx, optional: false },
  }).validator({
    clean: true
  }),
  run({ _id }) {
    if (!Meteor.userId()) {
      throw new Meteor.Error('Error.', 'You have to be logged in.')
    }

    addToSubscribers(_id, Meteor.userId())
  }
})

export const removeProblemImage = new ValidatedMethod({
  name: 'removeProblemImage',
  validate: new SimpleSchema({
    _id: { type: RegEx, optional: false },
    image: { type: String, optional: false }
  }).validator({
    clean: true
  }),
  run({ _id, image }) {
    if (!Meteor.userId()) {
      throw new Meteor.Error('Error.', 'You have to be logged in.')
    }

    let problem = Problems.findOne({_id: _id}) || {}

    if (problem.createdBy === Meteor.userId()) {
      Problems.update({
        _id: _id
      }, {
        $set: _.extend({
            lastActionTime: new Date().getTime()
        }, staleStatus(problem)),
        $pull: {
          images: image
        }
      })
    } else {
      throw new Meteor.Error('Error.', 'You can\'t edit a problem that\'s not your.')
    }
  }
})

export const unwatchProblem = new ValidatedMethod({
  name: 'unwatchProblem',
  validate: new SimpleSchema({
    _id: { type: RegEx, optional: false },
  }).validator({
    clean: true
  }),
  run({ _id }) {
    if (!Meteor.userId()) {
      throw new Meteor.Error('Error.', 'You have to be logged in.')
    }

    let problem = Problems.findOne({
        _id: _id
    })

    Problems.update({
      _id: _id
    }, {
        $set: _.extend({
            lastActionTime: new Date().getTime()
        }, staleStatus(problem)),
      $pull: {
        subscribers: Meteor.userId()
      }
    })
  }
})

//allow a user to unclaim a problem
export const unclaimProblem = new ValidatedMethod({
    name: 'unclaimProblem',
    //Define the validation rules which will be applied on both the client and server
    validate: new SimpleSchema({
        _id: { type: RegEx, optional: false },
    }).validator(),
    run({ _id }) {
        //if authenticated, update the remove the claimed attribute to the logged in user.
        if (Meteor.userId()) {
          let problem = Problems.findOne({_id: _id});

          if (problem.claimedBy ===  Meteor.userId()) {
              Problems.update({
                  _id: _id
              }, {
                  $set: {
                    status: 'open',
                    lastActionTime: new Date().getTime()
                  },
                  $unset: {
                      estimate: true,
                      claimedBy: true,
                      claimed: true,
                      claimedFullname: true
                  }

              })

              Stats.upsert({
                  userId: Meteor.userId()
              }, {
                  $addToSet: {
                      unclaimedProblems: _id // save a separate list of unclaimed problems so we can see how many problems the user has claimed and then abandoned
                  }
              })

              sendToSubscribers(_id, Meteor.userId(), `${(Meteor.users.findOne(Meteor.userId()).profile || {}).name} unclaimed a problem you\'re watching.`)
              addToSubscribers(_id, Meteor.userId())

              return _id
          } else {
            throw new Meteor.Error('Error.', 'You cannot unclaim a problem that is not claimed by you')
          }

        } else {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }
    }
});

export const forceUnclaim = new ValidatedMethod({
    name: 'forceUnclaim',
    validate: new SimpleSchema({
        _id: { type: RegEx, optional: false },
    }).validator(),
    run({ _id }) {
        if (Meteor.userId()) {
            let user = Meteor.users.findOne({
                _id: Meteor.userId()
            }) || {}

            if (user.moderator) {
                let problem = Problems.findOne({_id: _id})

                Problems.update({
                    _id: _id
                }, {
                    $set: {
                        status: 'open',
                        lastActionTime: new Date().getTime()
                    },
                    $unset: {
                        estimate: true,
                        claimedBy: true,
                        claimed: true,
                        claimedFullname: true
                    }
                })

                Stats.upsert({
                    userId: problem.claimedBy
                }, {
                    $addToSet: {
                      unclaimedProblems: _id // save a separate list of unclaimed problems so we can see how many problems the user has claimed and then abandoned
                    }
                })

                sendToSubscribers(_id, Meteor.userId(), `Moderator ${(Meteor.users.findOne(Meteor.userId()).profile || {}).name} forcefully unclaimed a problem you\'re watching.`)
                addToSubscribers(_id, Meteor.userId())

                return _id
            } else {
                throw new Meteor.Error('Error.', 'You cannot forcefullu unclaim a problem if you\'re not a moderator')
            }
        } else {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }
    }
})

//allow a user to claim a problem
export const claimProblem = new ValidatedMethod({
    name: 'claimProblem',
    //Define the validation rules which will be applied on both the client and server
    validate: new SimpleSchema({
        _id: { type: RegEx, optional: false },
        estimate: { type: Number, optional: false },
    }).validator(),
    run({ _id,estimate }) {
        if (Meteor.userId()) {
            let problem = Problems.findOne({_id: _id});

            if (problem.claimed === undefined || problem.claimed === false) {

                let getName = Meteor.users.findOne({_id: Meteor.userId()}).profile.name;
                console.log(getName)

                Problems.update({
                    _id: _id
                }, {
                    $set: {
                        status: 'in progress',
                        estimate: estimate,
                        claimedBy: Meteor.userId(),
                        claimed: true,
                        claimedDateTime: new Date().getTime(),
                        claimedFullname: getName,
                        lastActionTime: new Date().getTime()
                    }
                })

                Stats.upsert({
                    userId: Meteor.userId()
                }, {
                    $addToSet: {
                        claimedProblems: _id
                    },
                    $pull: {
                        unclaimedProblems: _id
                    }
                })

                sendToSubscribers(_id, Meteor.userId(), `${(Meteor.users.findOne(Meteor.userId()).profile || {}).name} claimed a problem you\'re watching.`)
                addToSubscribers(_id, Meteor.userId())

                return _id;
            } else {
                throw new Meteor.Error('Error.', 'You cannot claim a problem that is already claimed')
            }
        } else {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }
    }
});

export const readFYIProblem = new ValidatedMethod({
    name: 'readFYIProblem',
    //Define the validation rules which will be applied on both the client and server
    validate: new SimpleSchema({
        _id: { type: RegEx, optional: false },
    }).validator(),
    run({ _id }) {
        if (Meteor.userId()) {
            let problem = Problems.findOne({
                _id: _id
            }) || {}

            Problems.update({
                _id: _id
            }, {
                $set: _.extend({
                    lastActionTime: new Date().getTime()
                }, staleStatus(problem)),
                $addToSet: {
                    read: Meteor.userId()
                }
            })

            return _id;
        } else {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }
    }
})

export const problemApproval = new ValidatedMethod({
    name: 'problemApproval',
    validate: new SimpleSchema({
        _id: {
            type: RegEx,
            optional: false
        }
    }).validator(),
    run({ _id }) {
        if (Meteor.userId()) {
            let problem = Problems.findOne({
                _id: _id
            }) || {}

            if (problem.createdBy !== Meteor.userId()) {
                Problems.update({
                    _id: _id
                }, {
                    $set: _.extend({
                        lastActionTime: new Date().getTime()
                    }, staleStatus(problem)),
                    [!~(problem.approvals || []).indexOf(Meteor.userId()) ? '$addToSet' : '$pull']: {
                        approvals: Meteor.userId()
                    }
                })
            } else {
                throw new Meteor.Error('Error.', 'You can\'t +1 your own problem.')
            }

            return _id
        } else {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }
    }
})

//allow a user to edit a problem
export const editProblem = new ValidatedMethod({
	name: 'editProblem',
	validate: new SimpleSchema({
		'id': { type: String, optional: false},
		'summary': { type: String, max: 70, optional: false},
		'description': { type: String, max: 1000, optional: true},
        'solution': { type: String, max: 1000, optional: true},
        'isProblemWithEmurgis': { type: Boolean, optional: true },
        'estimate': { type: Number, optional: true },
        fyiProblem: { type: Boolean, optional: true },
        images: { type: Array, optional: true },
            'images.$': { type: String, optional: true }
	}).validator(),
	run({ id, summary, description, solution, isProblemWithEmurgis, fyiProblem, images, estimate }) {
		if (!Meteor.userId()) {
			throw new Meteor.Error('Error.', 'You have to be logged in.')
		}

    let problem = Problems.findOne({_id: id});

    if (problem.createdBy === Meteor.userId()) {
        Problems.update({'_id' : id}, { $set : _.extend({
          'summary': summary,
          'description': description || "",
          'solution': solution || "",
          'isProblemWithEmurgis': isProblemWithEmurgis,
          fyiProblem: fyiProblem,
          images: images,
          lastActionTime: new Date().getTime(),
        }, staleStatus(problem))
    })
    } else {
        throw new Meteor.Error('Error.', 'You cannot edit a problem you did not create')
    }
    return id;
	}
})
// end

// allow user to delete a problem
export const deleteProblem = new ValidatedMethod({
	name: 'deleteProblem',
	validate: new SimpleSchema({
		'id': { type: String, optional: false },
    reason: { type: String, optional: true }
	}).validator(),
	run({ id, reason }) {
      let problem = Problems.findOne({_id: id});

  		if (!Meteor.userId()) {
  			   throw new Meteor.Error('Error.', 'You have to be logged in.')
  		}

      if (problem.createdBy === Meteor.userId()) {
          // remove the context of the problem from the user stats for owner
          Stats.upsert({
              userId: problem.createdBy
          }, {
              $pull: {
                  loggedProblems: problem._id
              }
          })

          // remove the context of the problem from the user stats for claimer
          if (problem.claimedBy) {
            Stats.upsert({
                userId: problem.claimedBy
            }, {
                $pull: {
                    completedProblems: problem._id,
                    claimedProblems: problem._id,
                    unclaimProblems: problem._id
                }
            })
          }

          // delete the problem
          Problems.remove({'_id' : id})

      } else if (isModerator(Meteor.userId())) {
          Problems.update({
            _id: id
          }, {
            $set: {
              status: 'rejected',
              rejectionReason: reason,
              rejectedAt: new Date().getTime(),
              rejectedBy: Meteor.userId(),
              lastActionTime: new Date().getTime()
            }
          })

          Stats.upsert({
              userId: problem.createdBy
          }, {
              $addToSet: {
                  rejectedProblems: problem._id
              }
          })
      } else {
          throw new Meteor.Error('Error.', 'You cannot delete the problems you did not create')
      }
	}
});
//end

// allow users to change the problem status
export const markAsResolved = new ValidatedMethod({
    name: 'markAsResolved',
    validate: new SimpleSchema({
        problemId: { type: String, optional: false},
        claimerId: { type: String, optional: false},
        resolutionSummary: { type: String, optional: false}
    }).validator(),
    run({ problemId, claimerId, resolutionSummary }) {
        let problem = Problems.findOne({
          _id: problemId
        })

        if (claimerId !== Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You are not allowed to resolve this problem')
        }

        if (problem.createdBy !== claimerId) {
          Problems.update({ '_id' : problemId }, {
              $set : {
                  'status' : 'ready for review',
                  'resolveSteps': resolutionSummary,
                  'hasAcceptedSolution': false,
                  'resolvedDateTime': new Date().getTime(),
                  lastActionTime: new Date().getTime()
              }
          })
        } else {
          Problems.update({ '_id' : problemId }, {
              $set : {
                  'status' : 'closed',
                  'resolveSteps': resolutionSummary,
                  'hasAcceptedSolution': true,
                  'resolvedDateTime': new Date().getTime(),
                  resolved: true,
                  resolvedBy: claimerId,
                  lastActionTime: new Date().getTime()
              }
          })

          Stats.upsert({
              userId: problem.claimedBy
          }, {
              $addToSet: {
                  completedProblems: problemId
              }
          })
        }

        return problemId;
    }
});
// end

// allow users to unsolve a problem if its been solved
export const markAsUnSolved = new ValidatedMethod({
    name: 'markAsUnSolved',
    validate: new SimpleSchema({
        problemId: { type: String, optional: false},
        claimerId: { type: String, optional: false}
    }).validator(),
    run({ problemId, claimerId }) {

        if (claimerId !== Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You are not allowed to unsolve this problem')
        }

        Problems.update({ '_id' : problemId }, {
            $set : {
                'status' : 'in progress',
                lastActionTime: new Date().getTime()
            },
            $unset: {
                  resolvedDateTime:1,
                  hasAcceptedSolution: 1,
                  resolveSteps: 1
            },
            $push: {
              history: {
                event: 'Marked a problem as unsolved from solved',
                dateTime: new Date().getTime(),
                claimerId: claimerId
              }
            }
        });

        return problemId;
    }
});
// end

// allow users to change the status of probltm to close
export const updateStatus = new ValidatedMethod({
    name: 'updateStatus',
    validate: new SimpleSchema({
        problemId: { type: String, optional: false },
        status: { type: String, max: 60, optional: false },
        info: { type: String, optional: true }
    }).validator(),
    run({ problemId, status, info }) {

        let problem = Problems.findOne({_id: problemId});

        if (problem.createdBy !== Meteor.userId()) {
          throw new Meteor.Error('Error.', 'You are not allowed to open or close this problem')
        }

        let updateData = {
            lastActionTime: new Date().getTime()
        }
        updateData.status = status

        // if problem is being marked as close and its current is `ready for review`
        // we want to update it with th resolver id and resolved time
        if (status === 'closed' && problem.status === 'ready for review') {
            updateData.resolved = true
            updateData.resolvedBy = problem.claimedBy
            updateData.hasAcceptedSolution = true
        }

        if (status === 'open') {
            updateData.hasAcceptedSolution = false
            updateData.resolved = false
        }

        Problems.update({ '_id' : problemId }, { $set : updateData })

        if (status === 'closed' && info === 'actually-solved') {
            Stats.upsert({
                userId: problem.claimedBy
            }, {
                $addToSet: {
                    completedProblems: problemId
                }
            })
        } else {
          Stats.upsert({
              userId: problem.claimedBy
          }, {
              $pull: {
                  completedProblems: problemId
              }
          })
        }

        sendToSubscribers(problemId, Meteor.userId(), `${(Meteor.users.findOne(Meteor.userId()).profile || {}).name} ${status === 'open' ? 'reopened' : 'closed'} a problem you\'re watching.`)

        return problemId;
    }
});
//end

export const reopenProblem = new ValidatedMethod({
    name: 'reopenProblem',
    validate: new SimpleSchema({
        problemId: {
            type: String,
            optional: false
        },
        reason: {
            type: String,
            optional: false
        }
    }).validator(),
    run({ problemId, reason }) {
        let problem = Problems.findOne({
            _id: problemId
        })

        if (problem.createdBy === Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You can\'t reopen your own problem.')
        }

        if (problem.status !== 'closed') {
            throw new Meteor.Error('Error.', 'You can\'t reopen a problem that\'s not closed.')
        }

        Problems.update({
            _id: problemId
        }, {
            $set: {
                status: 'open',
                resolved: false,
                hasAcceptedSolution: false,
                resolvedBy: '',
                resolveSteps: '',
                claimedBy: '',
                claimed: false,
                claimedFullname: '',
                claimedDateTime: '',
                createdBy: Meteor.userId(), //take ownership
                lastActionTime: new Date().getTime()
            },
            $push: {
                previousSolutions: {
                    resolveSteps: problem.resolveSteps,
                    resolvedBy: problem.resolvedBy,
                    resolvedDateTime: problem.resolvedDateTime,
                    reopener: Meteor.userId(),
                    reason: reason,
                    date: new Date().getTime()
                }
            }
        })

        Stats.upsert({
            userId: problem.resolvedBy
        }, {
            $pull: {
                completedProblems: problemId
            }
        })

        sendToSubscribers(problemId, Meteor.userId(), `${(Meteor.users.findOne(Meteor.userId()).profile || {}).name} reopened a problem you\'re watching.`)

        return problemId
    }
})

// allow problem owners to kick out claimer
export const removeClaimer = new ValidatedMethod({
    name: 'removeClaimer',
    validate: new SimpleSchema({
        problemId: { type: String, optional: false }
    }).validator(),
    run ({ problemId }) {
        let problem = Problems.findOne({ _id : problemId })
        let currentClaimerId = problem.claimedBy

        if (problem.createdBy !== Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You are not allowed to remove claimer')
        }

        Problems.update({ _id: problemId }, {
            $set: {
                status: 'open',
                lastActionTime: new Date().getTime()
            },
            $unset: {
                claimedBy: true,
                claimed: true,
                claimedFullname: true
            }
        })

        Stats.upsert({ userId: currentClaimerId }, {
            $addToSet: {
                unclaimedProblems: problemId // save a separate list of unclaimed problems so we can see how many problems the user has claimed and then abandoned
            }
        })

        sendToSubscribers(problemId, Meteor.userId(), `${(Meteor.users.findOne(currentClaimerId).profile || {}).name} You have been removed from a problem you recently claimed.`)
        addToSubscribers(problemId, Meteor.userId())

        return problemId
    }
});
// end

// allow problem owners to nullify solution
export const rejectSolution = new ValidatedMethod({
    name: 'rejectSolution',
    validate: new SimpleSchema({
        problemId:  { type: String, optional: false },
        rejectReason:  { type: String, optional: false }
    }).validator(),
    run ({ problemId, rejectReason }) {
        let problem = Problems.findOne({ _id : problemId })

        if (problem.createdBy !== Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You are not allowed to reject solution')
        }

        let rejectedSolution = {}

        rejectedSolution.resolveSteps = problem.resolveSteps
        rejectedSolution.resolvedBy = problem.claimedBy
        rejectedSolution.rejectReason = rejectReason
        rejectedSolution.submittedAt = problem.resolvedDateTime
        rejectedSolution.rejectedAt = new Date().getTime()


        Problems.update({ _id : problemId }, {
            $set: {
                status :  'open',
                lastActionTime: new Date().getTime()
            },
            $unset : {
                resolveSteps: true,
                hasAcceptedSolution: true,
                resolvedDateTime: true,
                claimedBy: true,
                claimed: true,
                claimedFullname: true,
                claimedDateTime: true
            },
            $addToSet : {
                rejectedSolutions: rejectedSolution
            }
        })

        sendToSubscribers(problemId, Meteor.userId(), `Your solution has been rejected for the following reason ${'\'' + rejectReason + '\''} `)
        addToSubscribers(problemId, Meteor.userId())

        return problemId
    }
})
// end

export const checkForStaleProblems = new ValidatedMethod({
    name: 'checkForStaleProblems',
    validate: new SimpleSchema({}).validator(),
    run ({}) {
        Problems.find({}).fetch().filter(i => {
            return (i.status !== 'stale' && (i.status === 'open' || i.status === 'in progress') && i.lastActionTime) ? ((new Date().getTime() - i.lastActionTime) > (10 * 24 * 60 * 60 * 1000)) : false
        }).forEach(i => {
            Problems.update({
                _id: i._id
            }, {
                $set: {
                    status: 'stale',
                    oldStatus: i.status || 'open' // save the old status so we can return it if some activity happens
                }
            })

            sendNotification(i.createdBy, 'Your problem has been marked as \'Stale\' as it had no activity in the last 10 days. Check it out.', 'System', `/${i._id}`) // notify the user that his/her problem has became stale
        })
    }
})

export const fixStaleProblems = new ValidatedMethod({
    name: 'fixStaleProblems',
    validate: new SimpleSchema({}).validator(),
    run ({}) {
        Problems.find({}).fetch().filter(i => i.status === 'stale').forEach(i => {
            if (i.oldStatus !== 'in progress' && i.oldStatus !== 'open') {
                Problems.update({
                    _id: i._id
                }, {
                    $set: {
                        status: i.oldStatus
                    }
                })
            }
        })
    }
})

export const fixProblemImages = new ValidatedMethod({
    name: 'fixProblemImages',
    validate: new SimpleSchema({}).validator(),
    run ({}) {
        Problems.find({}).fetch().forEach(i => {
            if (i.images && i.images.length) {
                let found = false

                let nImages = i.images.map(j => {
                    if (j.includes('emurgis')) {
                        found = true

                        return `/images/${j.replace('/images/emurgis/', '')}`
                    }

                    return j
                })

                if (found) {
                    Problems.update({
                        _id: i._id
                    }, {
                        $set: {
                            images: nImages
                        }
                    })
                }
            }
        })
    }
})

if (Meteor.isDevelopment) {
    Meteor.methods({
        generateTestProblems: (context) => {
            context = context || 'all'

            for (let i = 0; i < 10; i++) {
                Problems.insert({
                    summary: "Derp",
                    description: "Lorem ipsum, herp derp durr.",
                    solution: "Lorem ipsum, herp derp durr.",
                    createdAt: new Date().getTime(),
                    createdBy: '',
                    status: 'open',
                    testContext: context
                })
            }
        },
        removeTestProblems: (context) => {
            context = context || 'all'

            Problems.remove({
                summary: 'Derp',
                testContext: context
            })
        }
    })
}
