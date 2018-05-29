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
            'summary': { type: String, max: 70, optional: false},
            'description': { type: String, max: 500, optional: true},
			'solution': { type: String, max: 500, optional: true}
            //url: {type: String, regEx:SimpleSchema.RegEx.Url, optional: false},
            //image: {label:'Your Image',type: String, optional: true, regEx: /\.(gif|jpg|jpeg|tiff|png)$/
        }).validator(),
    run({ summary,description, solution }) {
    	//Define the body of the ValidatedMethod, e.g. insert some data to a collection
		if (!Meteor.userId()) {
			throw new Meteor.Error('Error.', 'You have to be logged in.')
		}

		Problems.insert({
			'summary': summary,
			'description': description || "",
			'description': solution || "",
			'createdAt': new Date().getTime(),
			'createdBy': Meteor.userId() || ""
		})

        //if authenticated, update the claimed attribute to the logged in user.
        if (Meteor.userId()) {

            Problems.update({
               _id: _id
            }, {
                $set: {
                    claimedBy: this.userId,
                    claimed: true,
                    claimedDateTime: new Date().getTime(),
                    claimedFullname: Meteor.user().profile.name
                }
            })

        } else {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }
    }
});

//end

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
