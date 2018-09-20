import { Meteor } from "meteor/meteor"
import SimpleSchema from "simpl-schema"
import { ValidatedMethod } from "meteor/mdg:validated-method"

import { Comments } from "./commentsCollection.js"
import { Problems } from './problemCollection'

import { addToSubscribers, sendToSubscribers, updateLastAction } from './problemMethods'
import { sendNotification } from '/imports/api/notifications/both/notificationsMethods'

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
                'comment': { type: String, max: 500, optional: false },
                mentions: { type: Array, optional: true },
                "mentions.$": {type: String, optional: true},
                images: { type: Array, optional: true },
                'images.$': { type: String, optional: true }
            }).validator(),
            run({ problemId, comment, mentions, images }) {
                if (!Meteor.userId()) {
                    throw new Meteor.Error('Error.', 'You have to be logged in.')
                }

                let getName = Meteor.users.findOne({_id: this.userId}).profile.name;

                Comments.insert({
                    'problemId': problemId,
                    'comment': comment,
                    'createdAt': new Date().getTime(),
                    'createdByName': getName || "",
                    'createdBy': Meteor.userId() || "",
                    images: images
                })

                updateLastAction(problemId)

                sendToSubscribers(problemId, this.userId, `${getName} commented on a problem you\'re watching: ${comment}.`) // including a comment here looks kinda ugly, but it's more informative

                // send a notification to non subs who are mentioned in the comment
                mentions.forEach(user => {
                  //if (!subs.includes(user)) {
                    sendNotification(user, `${getName} mentioned you in a comment: ${comment.substr(0, 100) + (comment.length > 100 ? '&hellip;' : '')}`, '', `/${problemId}`, 'mention') // save this special notification for everyone
                  //}
                })

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

        updateLastAction(comment.problemId)
    }
})

export const editComment = new ValidatedMethod({
    name: 'editComment',
    validate: new SimpleSchema({
        commentId: { type: String, optional: false },
        comment: { type: String, max: 500, optional: false }
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

        updateLastAction(c.problemId)
    }
})

export const removeCommentImage = new ValidatedMethod({
    name: 'removeCommentImage',
    validate: new SimpleSchema({
        commentId: { type: String, optional: false },
        image: { type: String, optional: false }
    }).validator({
        clean: true
    }),
    run({ commentId, image }) {
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
            $pull: {
                images: image
            }
        })

        updateLastAction(c.problemId)
    }
})

export const likeComment = new ValidatedMethod({
    name: 'likeComment',
    validate: new SimpleSchema({
        commentId: {
            type: String,
            optional: false
        },
    }).validator(),
    run({ commentId }) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }

        let comment = Comments.findOne(
            { _id : commentId, likes : Meteor.userId() }
        )

        if (comment) {
            Comments.update({ _id : commentId }, {
                $pull : { likes : Meteor.userId() }
            })

            return commentId
        }

        Comments.update({ _id : commentId }, {
            $addToSet : { likes : Meteor.userId() }
        })

        return commentId
    }
})

export const fixCommentImages = new ValidatedMethod({
    name: 'fixCommentImages',
    validate: new SimpleSchema({}).validator(),
    run ({}) {
        Comments.find({}).fetch().forEach(i => {
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
                    Comments.update({
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