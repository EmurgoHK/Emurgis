export const Stats = new Mongo.Collection('stats')

if (Meteor.isServer) {
	Meteor.publish('userStats', uId => Stats.find({
		userId: uId || Meteor.userId() // default to the current user if available
	}))
}
