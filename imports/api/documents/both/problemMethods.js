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

export const addToSubscribers = (problemId, userId) => {
  Problems.update({
    _id: problemId
  }, {
    $addToSet: {
      subscribers: userId
    }
  })
}

export const sendToSubscribers = (problemId, authorId, message) => {
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
      'estimate': estimate || "",
      'createdAt': new Date().getTime(),
      'createdBy': Meteor.userId() || "",
      'status':'open',
      'isProblemWithEmurgis': isProblemWithEmurgis,
      fyiProblem: fyiProblem,
      subscribers: [Meteor.userId()],
      images: images
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

    Problems.update({
      _id: _id
    }, {
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
                  },
                  $unset: {
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

//allow a user to claim a problem
export const claimProblem = new ValidatedMethod({
    name: 'claimProblem',
    //Define the validation rules which will be applied on both the client and server
    validate: new SimpleSchema({
        _id: { type: RegEx, optional: false },
    }).validator(),
    run({ _id }) {
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
                        claimedBy: Meteor.userId(),
                        claimed: true,
                        claimedDateTime: new Date().getTime(),
                        claimedFullname: getName
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
            Problems.update({
                _id: _id
            }, {
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
        Problems.update({'_id' : id}, { $set : {
          'summary': summary,
          'description': description || "",
          'solution': solution || "",
          'estimate': estimate || "",
          'isProblemWithEmurgis': isProblemWithEmurgis,
          fyiProblem: fyiProblem,
          images: images
            }})
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
          Problems.remove({'_id' : id})
      } else if (isModerator(Meteor.userId())) {
          Problems.update({
            _id: id
          }, {
            $set: {
              status: 'rejected',
              rejectionReason: reason,
              rejectedAt: new Date().getTime(),
              rejectedBy: Meteor.userId()
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
                  'resolvedDateTime': new Date().getTime()
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
                  resolvedBy: claimerId
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
                'status' : 'in progress'
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

        let updateData = {}
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
            $set: { status: 'open' },
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
            $set: {status :  'open'},
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


if (Meteor.isDevelopment) {
    Meteor.methods({
        generateTestProblems: () => {
            for (let i = 0; i < 10; i++) {
                Problems.insert({
                    summary: "Derp",
                    description: "Lorem ipsum, herp derp durr.",
                    solution: "Lorem ipsum, herp derp durr.",
                    createdAt: new Date().getTime(),
                    createdBy: ''
                })
            }
        }
    })
}
