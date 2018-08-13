import { AutoForm } from "meteor/aldeed:autoform"
import marked from 'marked';

// ***************************************************************
// Config for client-side only
// ***************************************************************

// Extra logging for Autoform. Turn off in production!
AutoForm.debug()

// Markdown config
marked.setOptions({
    gfm: true,
    breaks: true,
});

// Theme configurations
// One-time append required theme's classes to the document body
if ($(window).width() < 991) {
  $('body').addClass('app header-fixed sidebar-fixed aside-menu-fixed');
} else {
  $('body').addClass('app header-fixed sidebar-fixed aside-menu-fixed sidebar-lg-show');
}
// listener to listen for window resize events, in order to display/hide navbar
$(window).resize(function(evt) {
    if ($(window).width() < 991) {
        $('body').removeClass("sidebar-lg-show")
    } else if (! $('body').hasClass("sidebar-lg-show")) {
        $('body').addClass("sidebar-lg-show")
    }
});

SubsCache = new SubsCache(5, 10)