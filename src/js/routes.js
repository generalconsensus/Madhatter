'use strict';

/**
 * Route configuration for the Madhatter module.
 */
app.config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {

        // For unmatched routes
        $urlRouterProvider.otherwise('/');

        // Application routes
        $stateProvider
            .state('index', {
                url: '/',
                templateUrl: 'templates/projects.html'
            })
            .state('project', {
                url: '/project/:projectID',
                templateUrl: 'templates/projectDetail.html'
            })
            .state('projectSetup', {
                url: '/projectSetup',
                templateUrl: 'templates/projectSetup.html',
                animation: true
            })
            .state('fileEditor', {
                url: '/fileEditor',
                templateUrl: 'templates/fileEditor.html',
                params: { fileNode: null, project: null, profiles: null, defaultProfile: null },
                animation: true
            });

    }
]);