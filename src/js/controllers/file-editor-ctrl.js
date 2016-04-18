app.controller('FileEditorController', ['$scope', '$stateParams', function ($scope, $stateParams) {
    $scope.project = $stateParams.project;
    $scope.file = $stateParams.fileNode;
    $scope.profiles = $stateParams.profiles;
    $scope.fileData = '';
    $scope.definitionListing = [];
    $scope.disabled = false;
    $scope.menu = [];
    $scope.alerts = [];
    $scope.editor = {};
    $scope.profileSelected = $stateParams.defaultProfile;
    $scope.featureTest = '';
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
        ipcRenderer.send('asynchronous-message', 'definitionList', $scope.project);
    }

    ipcRenderer.on('asynchronous-reply', function (event, type, data) {
        if (type == 'fileEdit') {
            $scope.$apply(function () {
                $scope.fileData = data.dataRaw;
            });
            // Grab the directory tree listing for the feature folder
        } else if (type == 'saveFile') {
            if (data.result) {
                $scope.addAlert('File Saved', 'success');
                // If we are running the file right after
                if (data.run) {
                    //Execute Feature
                    ipcRenderer.send('asynchronous-message', 'node-exec', {
                        features: $scope.project.featuresLocation + '/' + $scope.file.path,
                        profile: $scope.profileSelected.key,
                        profileLocation: $scope.project.profileLocation,
                        projectLocation: $scope.project.projectLocation,
                        id: $scope.project.key
                    });
                }
            } else {
                $scope.addAlert('Error Saving File', 'danger');
            }
        } else if (type == 'definitionList') {
            if (data) {
                $scope.$apply(function () {
                    $scope.definitionListing = data;
                });
            }
        } else if (type == 'node-exec') {
            if (data) {
                $scope.$apply(function () {
                    $scope.featureTest = data;
                });
            }
        }
    });


    var mode = 'gherkin';

    if ($scope.file.name.indexOf(".php") > -1) {
        mode = 'php';
    }

    // The ui-ace option
    $scope.aceOption = {
        mode: mode,
        onLoad: function (_ace) {

            // HACK to have the ace instance in the scope...
            $scope.modeChanged = function () {
                _ace.getSession().setMode("ace/mode/" + $scope.mode.toLowerCase());
            };
            $scope.editor = _ace;
        },
        advanced: {
            enableSnippets: true,
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true
        }
    };

    $scope.save = function () {
        var file_path = $scope.project.featuresLocation + '/' + $scope.file.path;
        ipcRenderer.send('asynchronous-message', 'saveFile', {run: false, file: file_path, fileData: $scope.fileData});
    };

    $scope.saveRun = function (profileSelected) {
        console.log(profileSelected);
        var file_path = $scope.project.featuresLocation + '/' + $scope.file.path;
        ipcRenderer.send('asynchronous-message', 'saveFile', {run: true, file: file_path, fileData: $scope.fileData});


    };

    $scope.insertDefintion = function (definition) {
        $scope.editor.insert(definition);
    };


}]);