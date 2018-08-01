import { Meteor } from 'meteor/meteor'
import { fixStaleProblems, fixProblemImages } from '/imports/api/documents/both/problemMethods'
import { fixCommentImages } from '/imports/api/documents/both/commentsMethods'

Meteor.startup(() => {
	SyncedCron.start()

	// the following can be commented out when everything is fixed on production
	fixStaleProblems.call({})
	fixProblemImages.call({})
	fixCommentImages.call({})
})