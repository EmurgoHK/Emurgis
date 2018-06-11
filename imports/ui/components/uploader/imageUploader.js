import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { uploadImage } from '/imports/api/uploader/imageUploader'
import { notify } from '/imports/modules/notifier'

import('crypto-js').then(c => window.CryptoJS = c.default)

import './imageUploader.html'

// use getImages to get all uploaded images from the uploader
// reset boolean flag marks if the upload form should reset to original state when you call getImages (useful when adding comments, not needed when creating problems)
// returns a simple array with image paths as strings
export const getImages = (reset) => {
    reset = reset || false

    let upInstance = Blaze.getView($('#imageInput')[0])._templateInstance

    let images = upInstance.images.get()

    if (reset) {
        upInstance.images.set([])

        $('#fileUploadValue').html('Upload an image')
        $('#imageInputLabel').addClass('btn-primary').removeClass('btn-success')          
    }              

    return images
}

Template.imageUploader.onCreated(function() {
    this.images = new ReactiveVar([])

    if (this.data.images) {
        this.images.set(this.data.images)
    }
})

Template.imageUploader.helpers({
    images: () => Template.instance().images.get()
})

Template.imageUploader.events({
    'change #imageInput': (event, templateInstance) => {
        const file = event.target.files[0]

        if (file) {
            $('#fileUploadValue').html('<i class=\'fas fa-circle-notch fa-spin\'></i> Uploading')

            const reader = new FileReader()

            reader.onload = fileLoadEvent => {
                const data = reader.result
                const md5 = CryptoJS.MD5(CryptoJS.enc.Latin1.parse(data)).toString()

                uploadImage.call({
                    fileName: file.name,
                    data: reader.result,
                    md5: md5
                }, (err, data) => {
                    if (err) {
                        notify(err.reason || err.message, 'error')
                    } else {
                        let images = templateInstance.images.get()
                        images.push(data)
                        templateInstance.images.set(images)

                        $('#fileUploadValue').html('Upload another image')
                        $('#imageInputLabel').removeClass('btn-primary').removeClass('btn-danger').addClass('btn-success')
                    }
                })
            }

            reader.readAsBinaryString(file)
        }
    }
})