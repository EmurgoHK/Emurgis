import { FlowRouter } from 'meteor/kadira:flow-router'
import { BlazeLayout } from 'meteor/kadira:blaze-layout'
import { appRoutes } from './group-config'

import '/imports/ui/components/stats/userStats'

appRoutes.route('/stats', {
    action: () => {
        BlazeLayout.render('layout', {
          main: 'userStats',
          footer: 'footer',
          header: 'header',
          sidebar: 'sidebar'
        })
    },
    name: 'stats'
})
