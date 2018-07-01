import { UserPresence } from 'meteor/socialize:user-presence'
import { Mongo } from 'meteor/mongo'

export const UserStats = new Mongo.Collection('userStats')

UserStats.deny({
  	insert: () => true,
  	update: () => true,
  	remove: () => true
})

if (Meteor.isServer) {
	UserPresence.onUserOnline((userId, connection) => {
  		UserStats.upsert({
  			_id: 'connected'
  		}, {
    		$addToSet: {
      			userIds: userId
    		}
  		})
  	})

	UserPresence.onUserOffline((userId) => {
  		UserStats.upsert({
  			_id: 'connected'
  		}, {
    		$pull: {
      			userIds: userId
    		}
  		})
	})

	Meteor.publish('onlineStats', () => UserStats.find({}))
}

delete Meteor.users._c2 // this is needed because user-modal package actually enforces a schema of his own, which is not compatible with our use case