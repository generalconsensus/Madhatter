app.controller('ModalInstanceCtrl', ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {


    $scope.ok = function () {
        $uibModalInstance.close();
        location.reload();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
        location.reload();
    };
}]);