import { Meteor } from "meteor/meteor"
import { Problems } from "/imports/api/documents/both/problemCollection.js"

// ***************************************************************
// REST API Endpoints
// Defines Rest endpoints for added collections
// ***************************************************************

if (Meteor.isServer) {
    Meteor.startup(() => {
        var Api = new Restivus({
            useDefaultAuth: false,
            defaultHeaders: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            prettyJson: true
        })

        /*
         * Generates the following endpoints 
         * 
         *  GET /api/problems
         * 
         *  Example response:
         * 
         *  {
         *      "status": "success",
         *      "data": [
         *          {...}, {...}
         *      ]
         *  }
         * 
         * 
         *  GET /api/problems/:id
         * 
         *  Example response:
         * 
         *  {
         *      "status": "success",
         *      "data": {
         *          "id": "CuH8L6PMsJoKdugkm",
         *          ...
         *      }
         *  }
        */
        Api.addCollection(Problems, {
            excludedEndpoints: ['put', 'post', 'delete']
        })
    })
}

