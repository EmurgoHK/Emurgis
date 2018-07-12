import { FlowRouter } from 'meteor/kadira:flow-router'
import { BlazeLayout } from 'meteor/kadira:blaze-layout'
import { appRoutes } from './group-config'

import '/imports/ui/components/notifications/notifications'
import '/imports/ui/components/mentions/mentions'

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

appRoutes.route('/mentions', {
    action: () => {
        BlazeLayout.render('layout', {
          main: 'mentions',
          footer: 'footer',
          header: 'header'
        })
    },
    name: 'mentions'
})
