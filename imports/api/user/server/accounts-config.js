import { Meteor } from "meteor/meteor"
import SimpleSchema from "simpl-schema"

const regex = /^[a-zA-Z0-9_.+-]+@(?:(?:[a-zA-Z0-9-]+\.)?[a-zA-Z]+\.)?(emurgo)\.io$/

Accounts.validateNewUser((user) => {
    new SimpleSchema({
        _id: { type: String },
        emails: { type: Array },
        'emails.$': { type: Object },
        'emails.$.address': { 
            type: String,
            regEx: regex
        },
        'emails.$.verified': { type: Boolean },
        createdAt: { type: Date },
        services: { type: Object, blackbox: true }
    }).validate(user);
    
    // Return true to allow user creation to proceed
    return true;
});


