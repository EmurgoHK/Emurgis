import { FlowRouter } from 'meteor/kadira:flow-router'
import { BlazeLayout } from 'meteor/kadira:blaze-layout'
import { appRoutes } from './group-config'

import '/imports/ui/components/profile/userProfile'
import '/imports/ui/components/profile/signInModal'
import '/imports/ui/components/profile/usernameModal'
import '/imports/ui/components/profile/editProfile'

appRoutes.route('/profile/:userId', {
  action: () => {
    BlazeLayout.render('layout', {
      main: 'userProfile',
      footer: 'footer',
      header: 'header',
      sidebar: 'sidebar'
    })
  },
  name: 'profile'
})

appRoutes.route('/profile/:userId/edit', {
  action: () => {
    BlazeLayout.render('layout', {
      main: 'editProfile',
      footer: 'footer',
      header: 'header',
      sidebar: 'sidebar'
    })
  },
  name: 'profile.edit'
})