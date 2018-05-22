import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { Accounts } from 'meteor/accounts-base';
import '/imports/startup/client';
import {FlowRouter} from 'meteor/ostrio:flow-router-extra';
window.FlowRouter = FlowRouter

import '/imports/client/UI/main.html';

Template.hello.onCreated(function helloOnCreated() {
  // counter starts at 0
  this.counter = new ReactiveVar(0);
});

Template.hello.helpers({
  counter() {
    return Template.instance().counter.get();
  },
});

Template.hello.events({
  'click button'(event, instance) {
    // increment the counter when button is clicked
    instance.counter.set(instance.counter.get() + 1);
  },
});
