// Accounts
ServiceConfiguration.configurations.remove({
  service: 'google'
})
ServiceConfiguration.configurations.insert({
  service: 'google',
  clientId: Meteor.settings.google ? Meteor.settings.google.clientId : '',
  secret: Meteor.settings.google ? Meteor.settings.google.secret : ''
})
