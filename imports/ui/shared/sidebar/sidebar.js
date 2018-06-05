import './sidebar.html'
import './sidebar.scss'

Template.sidebar.events({
    'click .sidebar-minimizer': function() {
        // toggle "sidebar-minimized" class to minimize/un-minimize sidebar
        $('body').toggleClass("sidebar-minimized")
    }
})