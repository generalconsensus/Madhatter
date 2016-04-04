const ipcRenderer = require('electron').ipcRenderer;

app.controller('FileController', ['$scope', 'folderUpload', function ($scope, folderUpload) {

    $scope.scanTarget = false;
    $scope.scan = function () {

        var folder = $scope.behatFolder;
        $scope.behatTargets = [];
        const ipcRenderer = require('electron').ipcRenderer;

        ipcRenderer.on('asynchronous-reply', function (event, type, version, file, project, parse) {
            $scope.$apply(function () {
                if (type == 'stopped_scanning') {
                    $scope.scanTarget = true;
                } else if (type == 'composer.lock') {
                    $scope.behatTargets.push({
                        projectName: project,
                        version: version,
                        featuresLocation: parse.dir + '/features',
                        profileLocation: parse.dir + '/behat.yml',
                        projectLocation: parse.dir
                    });
                }
            });
        });
        if (folder) {
            ipcRenderer.send('asynchronous-message', 'behat-search', folder);
        }
    };
}]);
