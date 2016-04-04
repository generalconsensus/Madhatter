app.controller('formSubmitController', ['$scope', function ($scope) {
        $scope.master = {};

        $scope.update = function (project) {
            $scope.master = angular.copy(project);
        };

        $scope.submit = function (behatTarget) {
            ipcRenderer.send('asynchronous-message', 'node-persist-project-save', {
                projectName: behatTarget.projectName,
                version: behatTarget.version,
                featuresLocation: behatTarget.featuresLocation,
                profileLocation: behatTarget.profileLocation,
                projectLocation: behatTarget.projectLocation
            });
            ipcRenderer.on('asynchronous-reply', function (event, response, type) {
                if (response == 'project_already_exists') {
                    behatTarget.msg = 'This Project Already Exists.';
                }
            });
        };
    }]);