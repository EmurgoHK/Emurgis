import { Meteor } from "meteor/meteor"
import SimpleSchema from "simpl-schema"
import { ValidatedMethod } from "meteor/mdg:validated-method"

import { Dependencies } from './dependenciesCollection'

const {
    RegEx
} = SimpleSchema

// TODO: Implement exaustive search here to check for dependencies
function checkCircularDependency() {

}

// adds dependencies
export const insertDependency = (pId, dId) => {
  var dependency = Dependencies.findOne({problemId: pId, dependencyId: dId});

  if (dependency != undefined && dependency._id) {
    throw new Meteor.Error('Error.', 'Dependency already exists')
  } else {
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
      let dependency = Dependencies.findOne({_id: id});

  		if (!Meteor.userId()) {
  			   throw new Meteor.Error('Error.', 'You have to be logged in.')
  		}

      if (dependency.createdBy === Meteor.userId()) {
          Dependencies.remove({'_id' : id})
      } else {
          throw new Meteor.Error('Error.', 'You cannot delete the problems you did not create')
      }
	}
});
