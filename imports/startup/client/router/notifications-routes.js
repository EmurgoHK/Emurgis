import { FlowRouter } from 'meteor/kadira:flow-router'
import { BlazeLayout } from 'meteor/kadira:blaze-layout'

import '/imports/ui/components/notifications/notifications'

FlowRouter.route('/notifications', {
    action: () => {
        BlazeLayout.render('layout', {
          main: 'notifications',
          footer: 'footer',
          header: 'header'
        })
    },
    name: 'stats'
})
