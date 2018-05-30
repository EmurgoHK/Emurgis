export const Comments = new Mongo.Collection('comments');

if (Meteor.isServer) {
    // This code only runs on the server
    Meteor.publish('comments', function commentsPublication(id) {
        if (id) {
            return Comments.find({ problemId: id });
        } else {
            return Comments.find();
        }
    });
}