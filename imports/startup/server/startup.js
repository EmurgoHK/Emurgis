import { Meteor } from 'meteor/meteor'

Meteor.startup(() => {
	SyncedCron.start()
})