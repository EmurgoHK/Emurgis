import './sidebar.html'
import './sidebar.scss'

Template.sidebar.events({
    'click .sidebar-minimizer': function() {
        // toggle "sidebar-minimized" class to minimize/un-minimize sidebar
        $('body').toggleClass("sidebar-minimized")
    },
    'click .nav-item': function() {
        // if we are on a mobile let's close the menu when navigating between menu clicks
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            $('body').removeClass('sidebar-lg-show')
        }

    },

})