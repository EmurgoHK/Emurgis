import { FlowRouter } from "meteor/kadira:flow-router"
import { Meteor } from "meteor/meteor"

export const appRoutes = FlowRouter.group({ })

export const modRoutes = FlowRouter.group({
	prefix: '/moderator',
  	name: 'moderator'
})