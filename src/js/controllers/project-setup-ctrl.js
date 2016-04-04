app.controller('ProjectSetupCtrl', ['$scope', '$uibModal', '$log', function ($scope, $uibModal, $log) {

    $scope.animationsEnabled = true;

    $scope.openModal = function () {

        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'templates/projectSetup.html',
            controller: 'ModalInstanceCtrl',
            size: 'lg'
        });

    };

    $scope.toggleAnimation = function () {
        $scope.animationsEnabled = !$scope.animationsEnabled;
    };
}]);