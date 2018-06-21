import { Meteor } from "meteor/meteor"
import { Problems } from "/imports/api/documents/both/problemCollection.js"

// ***************************************************************
// Fixtures (generate dummy data for the Problems collection)
// ***************************************************************

Meteor.startup(() => {
  if (Problems.find().count() === 0) {
    Problems.insert({
      summary: "Derp",
      description: "Lorem ipsum, herp derp durr.",
      createdAt: new Date().getTime(),
      createdBy: ''
    })

    Problems.insert({
      summary: "Hurr",
      description: "Lorem ipsum, herp derp durr.",
      createdAt: new Date().getTime(),
      createdBy: ''
    })

    Problems.insert({
      summary: "Durr",
      description: "Lorem ipsum, herp derp durr.",
      createdAt: new Date().getTime(),
      createdBy: ''
    })
  }
})



ServiceConfiguration.configurations.remove({
  service: 'google'
})
ServiceConfiguration.configurations.insert({
  service: 'google',
  clientId: '674768501370-e5i2mj3q5anso3tk30di9hpbo4f9sisg.apps.googleusercontent.com',
  secret: '4QfQW9v9Ol4okzmKzdjs7s_X'
})

// googleAuth : {
  //   'clientID'      : '', // your App ID
  //   'clientSecret'  : '4QfQW9v9Ol4okzmKzdjs7s_X', // your App Secret
  //   'callbackURL'   : 'http://localhost:8000/auth/google/callback'
