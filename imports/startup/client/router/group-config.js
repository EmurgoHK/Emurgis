import { FlowRouter } from "meteor/kadira:flow-router"
import { Meteor } from "meteor/meteor"

export const appRoutes = FlowRouter.group({
    triggersEnter: [(context, redirect) => {
        $('body').addClass('app header-fixed sidebar-fixed aside-menu-fixed sidebar-lg-show');
    }],
    triggersExit: [(context, redirect) => {
        $('body').removeClass('app header-fixed sidebar-fixed aside-menu-fixed sidebar-lg-show');
    }]
})