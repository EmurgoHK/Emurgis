import { FlowRouter } from 'meteor/kadira:flow-router'
import { BlazeLayout } from 'meteor/kadira:blaze-layout'

import '/imports/ui/components/stats/userStats'

FlowRouter.route('/stats/:userId?', {
    action: () => {
        BlazeLayout.render('layout', {
          main: 'userStats',
          footer: 'footer'
        })
    },
    name: 'stats'
})
