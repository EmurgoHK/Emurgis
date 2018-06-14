import { Problems } from '/imports/api/documents/both/problemCollection'
import { Comments } from '/imports/api/documents/both/commentsCollection'
import { Dependencies } from '/imports/api/documents/both/dependenciesCollection'

import { Notifications } from '/imports/api/notifications/both/notificationsCollection'

import { Stats } from '/imports/api/stats/both/statsCollection'

const collections = {
	Problems: Problems,
	Comments: Comments,
	Dependencies: Dependencies,
	Notifications: Notifications,
	Stats: Stats
}

Object.keys(collections).forEach(i => {
	if (!window[`testing${i}`]) {
		if (Meteor.isDevelopment) {
	    	window[`testing${i}`] = collections[i]
		} else {
			window[`testing${i}`] = {}
			window[`testing${i}`]['find'] = window[`testing${i}`]['findOne'] = () => {
				throw new Meteor.Error('Error.', `You can't reference testing${i} globally when in production, please dynamically import it accordingly.`)
			}
		}
	}
})