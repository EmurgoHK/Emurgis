import { FlowRouter } from "meteor/kadira:flow-router"
import { BlazeLayout } from "meteor/kadira:blaze-layout"

import "/imports/ui/components/auth/signin/signin.js"
import "/imports/ui/components/auth/signup/signup.js"

FlowRouter.route("/signin", {
  action: function() {
    BlazeLayout.render("layout", {
      main: "signin",
      footer: "footer"
    })
  },
  name: "signin"
})

FlowRouter.route("/signup", {
  action: function() {
    BlazeLayout.render("layout", {
      main: "signup",
      footer: "footer"
    })
  },
  name: "signup"
})
