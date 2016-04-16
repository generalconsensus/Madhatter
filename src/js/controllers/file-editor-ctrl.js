app.controller('FileEditorController', ['$scope', '$stateParams', function ($scope, $stateParams) {
    $scope.project = $stateParams.project;
    $scope.file = $stateParams.fileNode;
    $scope.fileData = '';
    $scope.disabled = false;
    $scope.menu = [];
    $scope.alerts = [];

    $scope.setDisabled = function () {
        $scope.disabled = !$scope.disabled;
    };

    $scope.addAlert = function (msg, type) {
        $scope.alerts.push({
            msg: msg,
            type: type
        });
    };

    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };

    if ($scope.project.featuresLocation && $scope.file.path) {
        ipcRenderer.send('asynchronous-message', 'fileEdit', $scope.project.featuresLocation + '/' + $scope.file.path);
    }

    ipcRenderer.on('asynchronous-reply', function (event, type, data) {
        if (type == 'fileEdit') {
            $scope.$apply(function () {
                $scope.fileData = data.dataRaw;
            });
            // Grab the directory tree listing for the feature folder
        } else if (type == 'saveFile') {
            if (data) {
                $scope.addAlert('File Saved', 'success');
            } else {
                $scope.addAlert('Error Saving File', 'danger');
            }
        }
    });


    // The ui-ace option
    $scope.aceOption = {
        mode: 'gherkin',
        onLoad: function (_ace) {

            // HACK to have the ace instance in the scope...
            $scope.modeChanged = function () {
                _ace.getSession().setMode("ace/mode/" + $scope.mode.toLowerCase());
            };

        },
        advanced: {
            enableSnippets: true,
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true
        }
    };

    $scope.save = function () {
        var file_path = $scope.project.featuresLocation + '/' + $scope.file.path;
        ipcRenderer.send('asynchronous-message', 'saveFile', {file: file_path, fileData: $scope.fileData});
    };



}]);