export const Stats = new Mongo.Collection('stats')

if (Meteor.isServer) {
	Meteor.publish('userStats', () => Stats.find({}))
}
