/**
 * Master Controller
 */

app.controller('MasterCtrl', ['$rootScope', '$scope', '$cookieStore', '$uibModal', '$state', '$log', MasterCtrl]);

function MasterCtrl($rootScope, $scope, $cookieStore, $uibModal, $state, $log) {
    /**
     * Sidebar Toggle & Cookie Control
     */
    var mobileView = 992;

    $scope.getWidth = function () {
        return window.innerWidth;
    };

    $scope.$watch($scope.getWidth, function (newValue, oldValue) {
        if (newValue >= mobileView) {
            if (angular.isDefined($cookieStore.get('toggle'))) {
                $scope.toggle = !$cookieStore.get('toggle') ? false : true;
            } else {
                $scope.toggle = true;
            }
        } else {
            $scope.toggle = false;
        }

    });

    $scope.toggleSidebar = function () {
        $scope.toggle = !$scope.toggle;
        $cookieStore.put('toggle', $scope.toggle);
    };

    window.onresize = function () {
        $scope.$apply();
    };

    $scope.animationsEnabled = true;

    $scope.openSetupModal = function (size) {

        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'templates/projectSetup.html',
            controller: 'ModalInstanceCtrl',
            size: 'lg',
            resolve: {}
        });

    };

    $scope.toggleAnimation = function () {
        $scope.animationsEnabled = !$scope.animationsEnabled;
    };

    $rootScope.navList = [
        {
            'title': 'Projects',
            'state': 'index',
            'params': '',
            'delete': false
        }
    ];

    $scope.deleteMenuItem = function (title) {

        if (title != 'Projects') {
            for (var i = 0; i < $rootScope.navList.length; i++) {
                if ($rootScope.navList[i].title == title) {
                    $rootScope.navList.splice(i, 1);
                    break;
                }
            }
            //// Send us back to the Index if there are no other tabs
            //if ($rootScope.navList.length == 1) {
            //    //TODO: This doesn't work for some reason
            //    $state.go('index');
            //}
        }
    }
}