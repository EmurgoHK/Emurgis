import { Meteor } from "meteor/meteor"
import SimpleSchema from "simpl-schema"
import { ValidatedMethod } from "meteor/mdg:validated-method"

import { Comments } from "./commentsCollection.js"
import { Problems } from './problemCollection'

import { addToSubscribers, sendToSubscribers } from './problemMethods'

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

                let getName = Meteor.users.findOne({_id: this.userId}).profile.name;

                Comments.insert({
                    'problemId': problemId,
                    'comment': comment,
                    'createdAt': new Date().getTime(),
                    'createdByName': getName || "",
                    'createdBy': Meteor.userId() || ""
                })

                sendToSubscribers(problemId, this.userId, `${getName} commented on a problem you\'re watching: ${comment}.`) // including a comment here looks kinda ugly, but it's more informative

                addToSubscribers(problemId, this.userId)
            }
})

export const deleteComment = new ValidatedMethod({
    name: 'deleteComment',
    validate: new SimpleSchema({
        commentId: { type: String, optional: false}
    }).validator(),
    run({ commentId }) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }

        let comment = Comments.findOne({ _id : commentId }) 

        if (comment.createdBy !== Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You are not allowed to delete this comment.')
        }

        Comments.remove({ _id : comment._id })
    }
})

export const editComment = new ValidatedMethod({
    name: 'editComment',
    validate: new SimpleSchema({
        commentId: { type: String, optional: false },
        comment: { type: String, max: 5000, optional: false }
    }).validator(),
    run({ commentId, comment }) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }

        let c = Comments.findOne({ _id : commentId }) 

        if (c.createdBy !== Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You are not allowed to edit this comment.')
        }

        Comments.update({
            _id: commentId
        }, {
            $set: {
                comment: comment
            }
        })
    }
})