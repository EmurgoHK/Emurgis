import { Meteor } from "meteor/meteor"
import SimpleSchema from "simpl-schema"
import { ValidatedMethod } from "meteor/mdg:validated-method"
import { Comments } from "./commentsCollection.js"


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

export const postComment = new ValidatedMethod({
            name: 'postComment',
            validate: new SimpleSchema({
                'problemId': { type: String, optional: false},
                'comment': { type: String, max: 5000, optional: false }
            }).validator(),
            run({ problemId, comment }) {
                if (!Meteor.userId()) {
                    throw new Meteor.Error('Error.', 'You have to be logged in.')
                }
                console.log(comment)
                let getName = Meteor.users.findOne({_id: this.userId}).profile.name;

                Comments.insert({
                    'problemId': problemId,
                    'comment': comment,
                    'createdAt': new Date().getTime(),
                    'createdByName': getName || "",
                    'createdBy': Meteor.userId() || ""
                })
            }
})
