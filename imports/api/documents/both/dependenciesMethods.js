import { Meteor } from "meteor/meteor"
import SimpleSchema from "simpl-schema"
import { ValidatedMethod } from "meteor/mdg:validated-method"

import { Dependencies } from './dependenciesCollection'
import { Problems } from './problemCollection'

const {
    RegEx
} = SimpleSchema

checkForCycles = (pId, dId) => {
  let deps = Dependencies.find({
    dependencyId: pId
  }).fetch()

  let tmpDeps = deps
  let found = false

  let depth = 0

  while (tmpDeps.length && !found && depth++ < 25) {
    tmpDeps.forEach(i => {
      i.parents = Dependencies.find({
        dependencyId: i.problemId
      }).fetch() || []
    })

    tmpDeps = _.flatten(tmpDeps.map(j => j.parents))

    tmpDeps.forEach(j => {
      if (j.problemId === dId) {
        found = true
      }   
    })
  }

  if (!found) {
    let deps = Dependencies.find({
      dependencyId: dId
    }).fetch()

    let tmpDeps = deps

    let depth = 0

    while (tmpDeps.length && !found && depth++ < 25) {
      tmpDeps.forEach(i => {
        i.parents = Dependencies.find({
          dependencyId: i.problemId
        }).fetch() || []
      })

      tmpDeps = _.flatten(tmpDeps.map(j => j.parents))

      tmpDeps.forEach(j => {
        if (j.problemId === pId) {
          found = true
        }   
      })
    }
  }

  return !found
}

// adds dependencies
export const insertDependency = (pId, dId) => {
  var dependency = Dependencies.findOne({problemId: pId, dependencyId: dId});

  if (dependency != undefined && dependency._id) {
    throw new Meteor.Error('Error.', 'Dependency already exists')
  } else {
    if (!checkForCycles(pId, dId)) {
      throw new Meteor.Error('Error.', 'Dependency tree can\'t contain cycles.')
    }
    Dependencies.insert({
      problemId: pId,
      dependencyId: dId,
      'createdAt': new Date().getTime(),
      'createdBy': Meteor.userId() || ""
    });
  }
}

// Lets users create
export const addDependency = new ValidatedMethod({
  name: 'addDependency',
  validate: new SimpleSchema({
    pId: { type: RegEx, optional: false },
    dId: { type: RegEx, optional: false }
  }).validator({
    clean: true
  }),
  run({ pId, dId }) {
    if (!Meteor.userId()) {
      throw new Meteor.Error('Error.', 'You have to be logged in.')
    }
    insertDependency(pId, dId);
  }
})

export const deleteDependency = new ValidatedMethod({
	name: 'deleteDependency',
	validate: new SimpleSchema({
		id: { type: String, optional: false}
	}).validator(),
	run({ id }) {
      let dependency = Dependencies.findOne({_id: id})

      let problem = Problems.findOne({
        _id: dependency.problemId
      })

  		if (!Meteor.userId()) {
  			   throw new Meteor.Error('Error.', 'You have to be logged in.')
  		}

      let user = Meteor.users.findOne({
        _id: Meteor.userId()
      })

      if (problem.createdBy === Meteor.userId() || user.moderator) {
          Dependencies.remove({'_id' : id})
      } else {
          throw new Meteor.Error('Error.', 'You cannot delete the problems you did not create')
      }
	}
});
