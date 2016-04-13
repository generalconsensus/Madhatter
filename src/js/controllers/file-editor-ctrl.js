app.controller('FileEditorController', ['$scope', '$stateParams', function ($scope, $stateParams) {
    console.log($stateParams);
    $scope.project = $stateParams.project;
    $scope.file = $stateParams.fileNode;
    $scope.fileData = '';

	if ($scope.project.featuresLocation && $scope.file.path) {
	    ipcRenderer.send('asynchronous-message', 'fileEdit', $scope.project.featuresLocation + '/' + $scope.file.path);
	}

    ipcRenderer.on('asynchronous-reply', function (event, type, data) {
        if (type == 'fileEdit') {
        	console.log(data);
            $scope.$apply(function () {
                $scope.fileData = data.dataRaw;
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

  // The modes
  $scope.modes = ['Gherkin'];
  $scope.mode = $scope.modes[0];
 
 
  // The ui-ace option
  $scope.aceOption = {
    mode: 'markdown',
    onLoad: function (_ace) {
 
      // HACK to have the ace instance in the scope...
      $scope.modeChanged = function () {
        _ace.getSession().setMode("ace/mode/" + $scope.mode.toLowerCase());
      };
 
    }
  };

  $scope.save = function () {

  };
 


}]);