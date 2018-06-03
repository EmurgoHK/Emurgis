import { Meteor } from "meteor/meteor"
import SimpleSchema from "simpl-schema"
import { ValidatedMethod } from "meteor/mdg:validated-method"
import { Problems } from "./problemCollection.js"

import { Stats } from '../../stats/both/statsCollection'


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

//Define a ValidatedMethod which can be called from both the client and server
//to validate data submitted on the problem form.
export const addProblem = new ValidatedMethod({
    name: 'addProblem',
    //Define the validation rules which will be applied on both the client and server
    validate:
        new SimpleSchema({
            summary: { type: String, max: 70, optional: false},
            description: { type: String, max: 500, optional: true},
			      solution: { type: String, max: 500, optional: true}
            //url: {type: String, regEx:SimpleSchema.RegEx.Url, optional: false},
            //image: {label:'Your Image',type: String, optional: true, regEx: /\.(gif|jpg|jpeg|tiff|png)$/
        }).validator(),
    run({ summary, description, solution }) {
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
      'status':'open'
    })

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

                return _id;
            } else {
                throw new Meteor.Error('Error.', 'You cannot claim a problem that is already claimed')
            }
        } else {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }
    }
});

//end

//allow a user to edit a problem
export const editProblem = new ValidatedMethod({
	name: 'editProblem',
	validate: new SimpleSchema({
		'id': { type: String, optional: false},
		'summary': { type: String, max: 70, optional: false},
		'description': { type: String, max: 500, optional: true},
		'solution': { type: String, max: 500, optional: true}
	}).validator(),
	run({ id, summary, description, solution }) {
		if (!Meteor.userId()) {
			throw new Meteor.Error('Error.', 'You have to be logged in.')
		}

    let problem = Problems.findOne({_id: id});

    if (problem.createdBy === Meteor.userId()) {
        Problems.update({'_id' : id}, { $set : {
          'summary': summary,
          'description': description || "",
          'solution': solution || ""
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
		'id': { type: String, optional: false}
	}).validator(),
	run({ id }) {
      let problem = Problems.findOne({_id: id});

  		if (!Meteor.userId()) {
  			   throw new Meteor.Error('Error.', 'You have to be logged in.')
  		}

      if (problem.createdBy === Meteor.userId()) {
          Problems.remove({'_id' : id})
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
        claimerId: { type: String, optional: false}
    }).validator(),
    run({ problemId, claimerId }) {

        if (claimerId !== Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You are not allowed to resolve this problem')
        }

        Problems.update({ '_id' : problemId }, {
            $set : { 'status' : 'ready for review' }
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

        Problems.update({ '_id' : problemId }, {
            $set : { 'status' : status }
        })

        if (status === 'closed' && info === 'actually-solved') {
            Stats.upsert({
                userId: Meteor.userId()
            }, {
                $addToSet: {
                    completedProblems: problemId
                }
            })
        } else {
          Stats.upsert({
              userId: Meteor.userId()
          }, {
              $pull: {
                  completedProblems: problemId
              }
          })
        }

        return problemId;
    }
});
//end
