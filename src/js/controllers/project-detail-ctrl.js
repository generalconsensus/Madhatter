app.controller('ProjectDetailController', ['$rootScope', '$scope', '$stateParams', '$uibModal', '$state', '$log', function ($rootScope, $scope, $stateParams, $uibModal, $state, $log) {
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
                var profiles = [];
                for (var key in data.data) {
                    profiles.push({key: key, profileData: data[key]});
                }
                $scope.$apply(function () {
                    $scope.profiles = profiles;
                });
            } else {
                $scope.addAlert('Profile Exception ' + data.data.name + ' error ' + data.data.reason, 'Error');
            }
            // Grab the Behat Test Results
        } else if (type == 'node-exec-reply') {
            //ipcRenderer.send('asynchronous-message', 'node-persist-project-test-lookup', {id: $scope.id});
            if (data) {
                $scope.$apply(function () {
                    $scope.testRunArray.push(data.payload);
                });
            } else {
                $scope.addAlert('Select a feature Folder or File to run begin running a test.', 'Error');
            }
            // Grab the Project Tests
        } else if (type == 'node-persist-project-test-lookup') {
            console.log(data);
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

    $scope.disabled = false;
    $scope.menu = [
        ['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript'],
        ['format-block'],
        ['font'],
        ['font-size'],
        ['font-color', 'hilite-color'],
        ['remove-format'],
        ['ordered-list', 'unordered-list', 'outdent', 'indent'],
        ['left-justify', 'center-justify', 'right-justify'],
        ['code', 'quote', 'paragraph'],
        ['link', 'image'],
        ['css-class']
    ];

    $scope.cssClasses = ['test1', 'test2'];

    $scope.setDisabled = function () {
        $scope.disabled = !$scope.disabled;
    };

    $scope.lastClicked = null;
    $scope.buttonClick = function ($event, node) {
        $scope.lastClicked = node;
        $event.stopPropagation();

        if (node.name) {
            var params = {fileNode: node, project: $scope.project, profiles: $scope.profiles, defaultProfile: $scope.profileCheckbox};
            $state.go('fileEditor', params);

            for (var key in $rootScope.navList) {
                if ($rootScope.navList[key].title == node.name) {
                    return;
                }
            }
            $rootScope.navList.push({
                'title': node.name,
                'state': 'fileEditor',
                'params': params,
                'delete': true
            });
        }
    }

}]);
