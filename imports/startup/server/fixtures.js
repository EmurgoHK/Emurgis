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
