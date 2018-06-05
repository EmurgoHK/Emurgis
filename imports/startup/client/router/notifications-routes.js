import { FlowRouter } from 'meteor/kadira:flow-router'
import { BlazeLayout } from 'meteor/kadira:blaze-layout'
import { appRoutes } from './group-config'

import '/imports/ui/components/notifications/notifications'

appRoutes.route('/notifications', {
    action: () => {
        BlazeLayout.render('layout', {
          main: 'notifications',
          footer: 'footer',
          header: 'header'
        })
    },
    name: 'notifications'
})
