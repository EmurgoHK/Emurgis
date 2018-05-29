import { FlowRouter } from "meteor/kadira:flow-router"
import { Meteor } from "meteor/meteor"

import { notify } from "/imports/modules/notifier"

// ***************************************************************
// Route filters & triggers
// ***************************************************************

// Simple redirect unless user is logged in
const mustBeLoggedIn = (context, redirect, stop) => {
  if (!Meteor.userId() && (!context.path.includes('/signin') && !context.path.includes('/signup'))) {
    redirect("documentsIndex")
    notify("Must be logged in!", "error")
  }
}

// Redirect user on logout
const onLogout = () => {
  redirect("documentsIndex")
  notify("User logged out", "success")
}

/*
Uncomment to require the user to be logged in to view og modify documents
Note: This is only handled client-side. Remember to do verification on the server as well
*/

FlowRouter.triggers.enter([mustBeLoggedIn], { except: ['documentsIndex', 'about'] })

// Redirect to home page when user logs out
Accounts.onLogout((user) => {
  notify("User logged out", "success")
  FlowRouter.go('/')
})
