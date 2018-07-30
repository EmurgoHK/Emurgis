import { Meteor } from 'meteor/meteor'
import { fixStaleProblems } from '/imports/api/documents/both/problemMethods'

Meteor.startup(() => {
	SyncedCron.start()

	fixStaleProblems.call({})
})