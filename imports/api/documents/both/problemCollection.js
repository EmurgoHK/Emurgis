export const Problems = new Mongo.Collection('problems');

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('problems', function problemsPublication() {
    return Problems.find();
  });
}
