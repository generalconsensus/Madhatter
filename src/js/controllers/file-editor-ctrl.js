app.controller('FileEditorController', ['$scope', '$stateParams', function ($scope, $stateParams) {
    console.log($stateParams);
    $scope.project = $stateParams.project;
    $scope.file = $stateParams.fileNode;
    $scope.fileData = {
        text: "hello"
        }

	if ($scope.project.featuresLocation && $scope.file.path) {
	    ipcRenderer.send('asynchronous-message', 'fileEdit', $scope.project.featuresLocation + '/' + $scope.file.path);
	}

    ipcRenderer.on('asynchronous-reply', function (event, type, data) {
        if (type == 'fileEdit') {
        	console.log(data);
            $scope.$apply(function () {
                $scope.fileData = '<pre>' + data.dataRaw + '</pre>';
            });
        // Grab the directory tree listing for the feature folder
        }
	});

    $scope.disabled = false;
    $scope.menu = [
    ];

    $scope.cssClasses = ['test1', 'test2'];

    $scope.setDisabled = function() {
        $scope.disabled = !$scope.disabled;
    }



}]);