import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { Stats } from '/imports/api/stats/both/statsCollection.js'

import Chart from 'chart.js'

import './userStats.html'

Template.userStats.onCreated(function() {
    this.autorun(() => {
        SubsCache.subscribe('users')
        SubsCache.subscribe('userStats')
    })
})

Template.userStats.onRendered(function() {
    const ctx = $('#js-chart')[0].getContext('2d')
    this.barChart = new Chart(ctx, {
        type: 'bar',
        data: {},
        options: {
            scales: {
              yAxes: [{
                ticks: {
                    beginAtZero: true
                }
              }]
            },
            responsive: true,
            legend: {
                display: false,
                position: 'top',
            },
            title: {
                display: false,
                text: 'Solved problems chart'
            }
        }
    })

    this.autorun(() => {
        let users = Meteor.users.find({}).fetch()

        if (users && users.length) {
            this.barChart.data.labels = users.map(i => (i.profile || {}).name || '')

            this.barChart.data.datasets = [{
                backgroundColor: '#20a8d8',
                borderColor: '#fff1f0',
                borderWidth: 1,
                data: users.map(i => {
                    let stats = Stats.findOne({
                        userId: i._id
                    })

                    return stats ? (stats.completedProblems || []).length : 0
                })
            }]

            this.barChart.update()
        }
    })
})

Template.userStats.helpers({
    users: () => Meteor.users.find({
        _id: {
            $ne: Meteor.userId()
        }
    }, {
        sort: {
            'profile.name': -1
        }
    }),
    stats: function () {
        return Stats.findOne({
            userId: this._id
        }) || {}
    },
    nullify: val => val || 0
})
