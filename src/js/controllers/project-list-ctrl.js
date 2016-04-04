app.controller('ProjectListController', ['$scope', function ($scope) {
    $scope.projectListing = [];

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
