import { Meteor } from "meteor/meteor"
import SimpleSchema from "simpl-schema"
import { ValidatedMethod } from "meteor/mdg:validated-method"
import { Problems } from "./problemCollection.js"


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

		return Problems.insert({
			'summary': summary,
			'description': description || "",
			'solution': solution || "",
			'createdAt': new Date().getTime(),
			'createdBy': Meteor.userId() || ""
		})
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
            Problems.update({
                _id: _id
            }, {
                $unset: {
                    claimedBy: true,
                    claimed: true,
                    claimedFullname: true
                }

            })
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
        //if authenticated, update the claimed attribute to the logged in user.
        if (Meteor.userId()) {
            Problems.update({
                _id: _id
            }, {
                $set: {
                    claimedBy: this.userId,
                    claimed: true,
                    claimedDateTime: new Date().getTime(),
                    claimedFullname: Meteor.user().name
                }
            })
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

		Problems.update({'_id' : id}, { $set : {
			'summary': summary,
			'description': description || "",
			'solution': solution || ""
		}})
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
		if (!Meteor.userId()) {
			throw new Meteor.Error('Error.', 'You have to be logged in.')
		}

		Problems.remove({'_id' : id})
	}
});
//end
