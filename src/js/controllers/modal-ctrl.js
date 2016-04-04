app.controller('ModalCtrl', ['$scope', '$uibModal', '$log', function ($scope, $uibModal, $log) {

    $scope.animationsEnabled = true;

    $scope.open = function (size) {

        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'templates/modalContent.html',
            controller: 'ModalInstanceCtrl',
            size: size,
        });

    };

    $scope.toggleAnimation = function () {
        $scope.animationsEnabled = !$scope.animationsEnabled;
    };

}]);

