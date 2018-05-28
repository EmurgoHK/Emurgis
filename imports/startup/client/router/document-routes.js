import { FlowRouter } from "meteor/kadira:flow-router"
import { BlazeLayout } from "meteor/kadira:blaze-layout"

import "/imports/ui/components/documents/index/documents-index.js"
import "/imports/ui/components/documents/new/document-new.js"
import "/imports/ui/components/documents/show/document-show.js"

// ***************************************************************
// Document routes
// ***************************************************************

// DOCUMENTS INDEX
// -------------------------------------------------------
FlowRouter.route("/", {
  action: function() {
    BlazeLayout.render("layout", {
      header: "header",
      main: "documentsIndex",
      footer: "footer"
    })
  },
  name: "documentsIndex"
})

// DOCUMENT NEW
// -------------------------------------------------------
FlowRouter.route("/new", {
  action: function() {
    BlazeLayout.render("layout", {
      header: "header",
      main: "documentNew",
      footer: "footer"
    })
  },
  name: "documentNew"
})

// DOCUMENT SHOW
// -------------------------------------------------------
FlowRouter.route("/:documentId", {
  action: function() {
    BlazeLayout.render("layout", {
      header: "header",
      main: "documentShow",
      footer: "footer"
    })
  },
  name: "documentShow"
})