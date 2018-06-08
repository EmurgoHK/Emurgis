import './rejected-solutions.html'

Template.rejectedSolutions.onCreated(function() {
    this.getDocumentId = () => FlowRouter.getParam("documentId")
  
    this.autorun(() => {
      this.subscribe('users')
    })
})

Template.rejectedSolutions.helpers({
    getResolverById: (resolverId) => {
        return Meteor.users.findOne({ _id : resolverId}).profile.name
    }     
})