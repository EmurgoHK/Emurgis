import { Meteor } from 'meteor/meteor'

import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'

import mime from './mimeType'

import fs from 'fs'
import CryptoJS from 'crypto-js'

export const uploadImage = new ValidatedMethod({
    name: 'uploadImage',
    validate: new SimpleSchema({
        fileName: {
            type: String
        },
        data: {
            type: String
        },
        md5: {
            type: String
        }
    }).validator({
        clean: true
    }),
    run({ fileName, data, md5 }) {
        const uploadDir = '/home/gareth/emurgis_assets/static/images/'

        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You must be logged in.')
        }

        const md5validate = CryptoJS.MD5(CryptoJS.enc.Latin1.parse(data)).toString()

        if (md5validate !== md5) {
            throw new Meteor.Error('Error.', 'Failed to validate md5 hash of the image. Please try again.')
        }

        const mimetype = mime.lookup(fileName)
        const validFile = ['image/png', 'image/gif', 'image/jpeg'].includes(mimetype)

        if (!validFile) {
            throw new Meteor.Error('Error.', 'File type is not supported. Only png, gif and jpeg are supported.')
        }

        const fileExtension = mime.extension(mimetype)

        fileName = fileName.replace(`.${fileExtension}`, '')

        const filenameThumbnail = `${uploadDir}${Meteor.userId()}-${fileName}-${new Date().getTime()}_thumbnail.${fileExtension}`

        const filename = `${Meteor.userId()}-${fileName}-${new Date().getTime()}.${fileExtension}`

        if (Meteor.isServer) {
            fs.writeFileSync(`${uploadDir}${filename}`, data, {
                encoding: 'binary'
            }, Meteor.bindEnvironment(error => {
                if (error) {
                    console.log('Error - ', error)
                }
            }))

            if (gm.isAvailable) {
                const size = {
                    width: 100,
                    height: 100
                }

                gm(`${uploadDir}${filename}`).resize(size.width, `${size.height}>`).gravity('Center').write(filenameThumbnail, error => {
                    if (error) {
                        console.log('Error - ', error)
                    }
                })
            }
        }

        return `/images/${filename}`
    }
})
