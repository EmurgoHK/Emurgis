export const Dependencies = new Mongo.Collection('dependencies');

if (Meteor.isServer) {
    // This code only runs on the server
    Meteor.publish('dependencies', function dependenciesPublication(id) {
        if (id) {
            return Dependencies.find({ problemId: id });
        } else {
            return Dependencies.find();
        }
    });
}
