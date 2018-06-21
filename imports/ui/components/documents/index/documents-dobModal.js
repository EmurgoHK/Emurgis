import { Template } from "meteor/templating"
import { notify } from "/imports/modules/notifier"

import { provideDob } from "/imports/api/user/both/userMethods.js"

import "./documents-dobModal.html"


Template.dobModal.events({
    'submit'(event){
        event.preventDefault();
        
        let dob = event.target.dob.value

        if (dob === undefined || dob === '') {
            notify('Please provide your date of birth', 'error')
            return true
        }

        provideDob.call({ 
         dob: dob
        }, (err, resp) => {
            if(err) { 
                notify(err.message, 'error') 
                return true
            }
            //success, close the modal.
            $('#dobModal').modal('hide')

        })

        event.preventDefault();
    }
})