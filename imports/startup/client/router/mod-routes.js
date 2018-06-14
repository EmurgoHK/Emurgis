import { FlowRouter } from 'meteor/kadira:flow-router'
import { BlazeLayout } from 'meteor/kadira:blaze-layout'
import { modRoutes } from './group-config'

import '/imports/ui/components/moderator/users/userList'

modRoutes.route('/users', {
    action: () => {
        BlazeLayout.render('layout', {
          main: 'userList',
          footer: 'footer',
          header: 'header',
          sidebar: 'sidebar'
        })
    },
    name: 'userList'
})
