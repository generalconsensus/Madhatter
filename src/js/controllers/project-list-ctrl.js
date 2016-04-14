app.controller('ProjectListController', ['$scope', '$rootScope', function ($scope, $rootScope) {
    $scope.projectListing = [];

    $scope.buildMenuItem = function(project) {
         console.log(project);
         if (project) {
            $rootScope.navList.push({
                'title': project.projectName,
                'state': 'project',
                'params': project
            });    
         } 
    }

    ipcRenderer.send('asynchronous-message', 'node-persist-project-listing-lookup');

    ipcRenderer.on('asynchronous-reply', function (event, type, response) {
        if (type == 'node-persist-project-listing-lookup') {
            $scope.$apply(function () {
                $scope.projectListing = response;
            });

        }
    });

    $scope.delete = function (project) {

        ipcRenderer.send('asynchronous-message', 'node-persist-project-delete', {
            project: project
        });

        ipcRenderer.on('asynchronous-reply', function (event, type, response) {
            if (type == 'node-persist-project-delete') {
                $scope.$apply(function () {
                    $scope.projectListing.splice(response, 1);
                });
            }
        });

    };
}]);
