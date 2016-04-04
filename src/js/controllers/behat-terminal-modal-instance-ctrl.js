app.controller('BehatTerminalModalInstanceCtrl', ['$scope', '$uibModalInstance', 'testRun', function ($scope, $uibModalInstance, testRun) {

    $scope.testRun = testRun;

    $scope.ok = function () {
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);