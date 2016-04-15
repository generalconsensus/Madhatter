app.controller('FileEditorController', ['$scope', '$stateParams', function ($scope, $stateParams) {
    $scope.project = $stateParams.project;
    $scope.file = $stateParams.fileNode;
    $scope.fileData = '';

    if ($scope.project.featuresLocation && $scope.file.path) {
        ipcRenderer.send('asynchronous-message', 'fileEdit', $scope.project.featuresLocation + '/' + $scope.file.path);
    }

    ipcRenderer.on('asynchronous-reply', function (event, type, data) {
        if (type == 'fileEdit') {
            $scope.$apply(function () {
                $scope.fileData = data.dataRaw;
            });
            // Grab the directory tree listing for the feature folder
        }
    });

    $scope.disabled = false;
    $scope.menu = [];

    $scope.cssClasses = ['test1', 'test2'];

    $scope.setDisabled = function () {
        $scope.disabled = !$scope.disabled;
    };


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
        console.log('test');
    };


}]);