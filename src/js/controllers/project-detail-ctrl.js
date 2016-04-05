app.controller('ProjectDetailController', ['$scope', '$stateParams', '$uibModal', '$log', function ($scope, $stateParams, $uibModal, $log) {
    const ipcRenderer = require('electron').ipcRenderer;
    const shell = require('electron').shell;

    // get the id
    $scope.id = $stateParams.projectID;
    $scope.features = [];
    $scope.profiles = [];
    $scope.behatResponse = [];
    $scope.profileCheckbox = {
        key: 'default'
    };
    $scope.testRunArray = [];
    $scope.alerts = [];

    //Grab the persistent project detail information
    ipcRenderer.send('asynchronous-message', 'node-persist-project-detail-lookup', {id: $scope.id});

    //Grab the persistent test information
    ipcRenderer.send('asynchronous-message', 'node-persist-project-test-lookup', {id: $scope.id});

    ipcRenderer.on('asynchronous-reply', function (event, type, data) {

        if (type == 'node-persist-project-detail-lookup') {
            $scope.$apply(function () {
                $scope.project = data;
            });
            if ($scope.project.featuresLocation) {
                ipcRenderer.send('asynchronous-message', 'featureListing', $scope.project.featuresLocation);
            }

            if ($scope.project.profileLocation) {
                ipcRenderer.send('asynchronous-message', 'profileLookup', $scope.project.profileLocation);
            }
        // Grab the directory tree listing for the feature folder
        } else if (type == 'featureListing') {
            if (data) {
                $scope.$apply(function () {
                    $scope.features = data.fileTree;
                });
            } else {
                $scope.addAlert('Features Folder is Missing', 'Error');
            }
        // Grab the the available profiles
        } else if (type == 'profileLookup') {
            if (data && data.success) {
              for (var key in data.data) {
                  $scope.$apply(function () {
                      $scope.profiles.push({key: key, profileData: data[key]});
                  });
              }
            } else {
              $scope.addAlert('Profile Exception ' + data.data.name + ' error ' + data.data.reason, 'Error');
            }
        // Grab the Behat Test Results
        } else if (type == 'node-exec-reply') {
            ipcRenderer.send('asynchronous-message', 'node-persist-project-test-lookup', {id: $scope.id});
        // Grab the Project Tests
        } else if (type == 'node-persist-project-test-lookup') {
            $scope.$apply(function () {
                $scope.testRunArray = data;
            });
        // Grab the Project Saves
        } else if (type == 'node-persist-project-test-save') {
            $scope.$apply(function () {
                $scope.testRunArray = data;
            });
        // Grab the Project Delete
        } else if (type == 'node-persist-project-test-delete') {
            $scope.$apply(function () {
                $scope.testRunArray = data;
            });
        }
    });

    $scope.addAlert = function (msg, type) {
        $scope.alerts.push({
            msg: msg,
            type: type
        });
    };

    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };

    $scope.execute = function (profileCheckbox) {
        if ($scope.selectedNode && $scope.selectedNode.type) {
            if ($scope.selectedNode.type == 'directory') {
                ipcRenderer.send('asynchronous-message', 'node-exec', {
                    features: $scope.project.featuresLocation + '/' + $scope.selectedNode.path,
                    profile: profileCheckbox.key,
                    profileLocation: $scope.project.profileLocation,
                    projectLocation: $scope.project.projectLocation,
                    id: $scope.id
                });
            } else if ($scope.selectedNode.type == 'file') {
                ipcRenderer.send('asynchronous-message', 'node-exec', {
                    features: $scope.project.featuresLocation + '/' + $scope.selectedNode.path,
                    profile: profileCheckbox.key,
                    profileLocation: $scope.project.profileLocation,
                    projectLocation: $scope.project.projectLocation,
                    id: $scope.id
                });
            }
        } else {
            $scope.addAlert('Select a feature Folder or File to run begin running a test.', 'Error');
        }
    };
    $scope.showSelectedFeature = function (sel) {
        $scope.selectedNode = sel;
    };


    $scope.treeOptions = {
        nodeChildren: "children",
        dirSelectable: true,
        injectClasses: {
            ul: "a1",
            li: "a2",
            liSelected: "a7",
            iExpanded: "a3",
            iCollapsed: "a4",
            iLeaf: "a5",
            label: "a6",
            labelSelected: "a8"
        }
    };

    $scope.folderOpen = function (folder) {
        shell.showItemInFolder(folder);
    };


//    Modal
    $scope.animationsEnabled = true;

    $scope.openModal = function (testRun) {

        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'templates/modalTerminal.html',
            controller: 'BehatTerminalModalInstanceCtrl',
            size: 'lg',
            resolve: {
                testRun: function () {
                    return testRun;
                }
            }
        });

    };

    $scope.toggleAnimation = function () {
        $scope.animationsEnabled = !$scope.animationsEnabled;
    };

    $scope.deleteAllTests = function () {
        ipcRenderer.send('asynchronous-message', 'node-persist-project-test-remove', {id: $scope.id});

        $scope.testRunArray = [];
    };


}]);
