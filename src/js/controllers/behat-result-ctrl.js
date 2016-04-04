// const ipcRenderer = require('electron').ipcRenderer;

app.controller('ProjectDetailController', ['$scope', '$stateParams', function ($scope, $stateParams) {
    const ipcRenderer = require('electron').ipcRenderer;

    // get the id
    $scope.result = $stateParams.result;


}]);